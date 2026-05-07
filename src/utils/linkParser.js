const WIKI_LINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export function parseWikiLinks(content) {
  const links = []
  let match
  while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
    const title = match[1].trim()
    const id = match[2] ? match[2].trim() : null
    links.push({ title, id, raw: match[0], index: match.index })
  }
  return links
}

export function extractReferencedIds(content) {
  const links = parseWikiLinks(content)
  return links.filter(l => l.id).map(l => l.id)
}

export function syncAllBacklinks(tree) {
  const allDocs = []
  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === 'document') {
        allDocs.push(node)
      }
      if (node.children) walk(node.children)
    }
  }
  walk(tree)

  const backlinkMap = {}
  for (const doc of allDocs) {
    backlinkMap[doc.id] = []
  }

  for (const doc of allDocs) {
    const refs = extractReferencedIds(doc.content || '')
    for (const refId of refs) {
      if (backlinkMap[refId] !== undefined && !backlinkMap[refId].includes(doc.id)) {
        backlinkMap[refId].push(doc.id)
      }
    }
  }

  return tree.map(node => updateBacklinksInNode(node, backlinkMap))
}

function updateBacklinksInNode(node, backlinkMap) {
  if (node.type === 'document') {
    const refs = extractReferencedIds(node.content || '')
    return {
      ...node,
      references: refs,
      backlinks: backlinkMap[node.id] || []
    }
  }
  if (node.children) {
    return { ...node, children: node.children.map(c => updateBacklinksInNode(c, backlinkMap)) }
  }
  return node
}

export function renderContentWithLinks(content, allDocsMap, onLinkClick) {
  if (!content) return null

  const parts = []
  let lastIndex = 0
  let match
  const regex = new RegExp(WIKI_LINK_REGEX.source, 'g')

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }

    const title = match[1].trim()
    const id = match[2] ? match[2].trim() : null
    const targetDoc = id ? allDocsMap[id] : null
    const exists = !!targetDoc

    parts.push({
      type: 'link',
      title,
      id,
      exists,
      raw: match[0]
    })

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }

  return parts
}

export function insertWikiLink(content, cursorPos, docTitle, docId) {
  const before = content.slice(0, cursorPos)
  const after = content.slice(cursorPos)

  const bracketMatch = before.match(/\[\[([^\]|]*)$/)
  if (bracketMatch) {
    const beforeBracket = before.slice(0, before.length - bracketMatch[0].length)
    const linkText = `[[${docTitle}|${docId}]]`
    return {
      content: beforeBracket + linkText + after,
      cursorOffset: beforeBracket.length + linkText.length
    }
  }

  return { content, cursorOffset: cursorPos }
}

export function findDocInTree(tree, docId) {
  function walk(nodes, path) {
    for (const node of nodes) {
      if (node.id === docId) {
        return { node, path: [...path, node.id] }
      }
      if (node.children) {
        const found = walk(node.children, [...path, node.id])
        if (found) return found
      }
    }
    return null
  }
  return walk(tree, [])
}

export function findProjectForDoc(tree, docId) {
  for (const project of tree) {
    const found = findDocInTree([project], docId)
    if (found) return project.id
  }
  return null
}

export function buildDocMap(tree) {
  const map = {}
  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === 'document') {
        map[node.id] = node
      }
      if (node.children) walk(node.children)
    }
  }
  walk(tree)
  return map
}

export function collectAllDocNames(tree) {
  const docs = []
  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === 'document') {
        docs.push({ id: node.id, name: node.name })
      }
      if (node.children) walk(node.children)
    }
  }
  walk(tree)
  return docs
}
