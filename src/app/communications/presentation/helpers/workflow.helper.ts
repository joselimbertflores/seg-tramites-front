import { workflow } from '../../infrastructure';

// --- Construcción de caminos completos (estructura moderna)
export function buildPaths(data: workflow[]): workflow[][] {
  const byId = new Map<string, workflow>();
  const childrenMap = new Map<string, string[]>();

  // Paso 1: indexar por ID y construir mapa de hijos
  for (const item of data) {
    const id = item._id;
    byId.set(id, item);

    const parentId = item?.parentId;
    if (parentId) {
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(id);
    }
  }

  // Paso 2: encontrar raíces (sin parentId)
  const roots = data.filter((c) => !c.parentId).map((c) => c._id);

  const paths: workflow[][] = [];

  // Paso 3: DFS con detección de ciclos
  function dfs(currentId: string, path: workflow[], visited: Set<string>) {
    if (visited.has(currentId)) {
      console.warn(`🚨 Ciclo detectado en ID: ${currentId}`);
      return;
    }

    const current = byId.get(currentId);
    if (!current) return;

    path.push(current);
    visited.add(currentId);

    const children = childrenMap.get(currentId);
    if (!children || children.length === 0) {
      paths.push([...path]); // Es hoja
    } else {
      for (const childId of children) {
        dfs(childId, path, visited);
      }
    }

    path.pop();
    visited.delete(currentId); // necesario para permitir otras ramas
  }

  // Paso 4: iniciar recorrido desde cada raíz
  for (const rootId of roots) {
    dfs(rootId, [], new Set());
  }

  return paths;
}

// --- Detección de estructura y separación de caminos
export function getWorkflowPaths(data: workflow[]): {
  title: string;
  path: workflow[];
  isOriginal: boolean;
}[] {
  if (!isModernWorkflow(data)) {
    return [
      {
        title: 'Flujo antiguo',
        path: data,
        isOriginal: false,
      },
    ];
  }

  const allPaths = buildPaths(data);

  let copyIndex = 1;

  const resolved = allPaths.map((path) => {
    const isOriginal = path.every((w) => w.isOriginal);
    return {
      path,
      isOriginal,
      title: isOriginal ? 'Original' : `Copia ${copyIndex++}`,
    };
  });

  // Ordena: original primero, luego copias
  return resolved.sort(
    (a, b) => (b.isOriginal ? 1 : 0) - (a.isOriginal ? 1 : 0)
  );
}

// --- Construcción de camino hacia una comunicación específica
export function buildPathTo(targetId: string, data: workflow[]): workflow[] {
  const byId = new Map<string, workflow>();
  const path: workflow[] = [];

  for (const item of data) {
    byId.set(item._id, item);
  }

  let current = byId.get(targetId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}

// --- Deteccion de estructura
export function getWorkflowPathTo(targeId: string, data: workflow[]) {
  if (!isModernWorkflow(data)) {
    return {
      title: 'Flujo antiguo',
      isOriginal: false,
      path: data,
    };
  }
  const path = buildPathTo(targeId, data);
  const isOriginal = path.every((w) => w.isOriginal);

  return {
    path,
    isOriginal,
    title: isOriginal ? 'Original' : `Copia`,
  };
}

export function isModernWorkflow(workflow: workflow[]): boolean {
  return workflow.some((w) => w.isOriginal === true);
}
