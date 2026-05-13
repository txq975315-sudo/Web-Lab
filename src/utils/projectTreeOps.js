/**
 * 项目树纯函数（无 React、无闭包依赖）。由 LabContext 与 reducer 调用。
 */

export function findNodeById(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function collectDocuments(tree) {
  const docs = []
  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === 'document') {
        docs.push(node)
      }
      if (node.children) {
        walk(node.children)
      }
    }
  }
  walk(tree)
  return docs
}

export function findProjectForDoc(tree, docId) {
  for (const project of tree) {
    if (findNodeById([project], docId)) return project.id
  }
  return null
}

export function extractAllTextForReferences(doc) {
  const parts = []
  if (doc.content) {
    parts.push(typeof doc.content === 'string' ? doc.content : doc.content.text || '')
  }
  if (doc.fields) {
    for (const v of Object.values(doc.fields)) {
      if (v && typeof v === 'string') parts.push(v)
    }
  }
  return parts.join('\n')
}

export function updateNodeInTree(tree, id, updater) {
  return tree.map(node => {
    if (node.id === id) {
      return updater(node)
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updater) }
    }
    return node
  })
}

export function addNodeToParent(tree, parentId, newNode) {
  return tree.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), newNode] }
    }
    if (node.children) {
      return { ...node, children: addNodeToParent(node.children, parentId, newNode) }
    }
    return node
  })
}

export function removeNodeFromTree(tree, nodeId) {
  return tree
    .filter(node => node.id !== nodeId)
    .map(node => {
      if (node.children) {
        return { ...node, children: removeNodeFromTree(node.children, nodeId) }
      }
      return node
    })
}
