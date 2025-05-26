import { workflow } from '../../../communications/infrastructure';

export function buildPaths(communications: workflow[]): workflow[][] {
  const byId = new Map<string, workflow>();
  const childrenMap = new Map<string, string[]>();

  // Paso 1: indexar por ID y construir mapa de hijos
  for (const comm of communications) {
    const id = comm._id;
    byId.set(id, comm);

    const parentId = comm?.parentId;
    if (parentId) {
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(id);
    }
  }

  // Paso 2: encontrar raíces (sin parentId)
  const roots = communications.filter((c) => !c.parentId).map((c) => c._id);

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

export function resolveWorkflowPaths(raw: workflow[]): {
  title: string;
  path: workflow[];
  isOriginal: boolean;
}[] {
  const isModern = raw.some((w) => w.isOriginal === true);

  if (!isModern) {
    return [
      {
        title: 'Flujo antiguo',
        path: raw,
        isOriginal: false,
      },
    ];
  }

  const allPaths = buildPaths(raw);

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
