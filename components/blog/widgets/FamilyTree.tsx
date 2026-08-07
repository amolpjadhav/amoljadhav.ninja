'use client';

interface TreeNode {
  label: string;
  note?: string;
  color?: string;
  icon?: string;
  children?: TreeNode[];
}

interface Positioned {
  node: TreeNode;
  x: number;
  y: number;
  children: Positioned[];
}

const CIRCLE_D = 64;
const CIRCLE_R = CIRCLE_D / 2;
const TEXT_BLOCK = 48; // space reserved below a circle for its name + note
const STEM_GAP = 24; // gap before/after the horizontal bus line
const LEVEL_HEIGHT = CIRCLE_R + TEXT_BLOCK + STEM_GAP + STEM_GAP + CIRCLE_R;
const SPACING_X = 190;
const TOP_MARGIN = 50;

// Lays out the tree left-to-right by leaf order, assigning each node a
// pixel center (x, y). Parents are centered over the midpoint of their
// children, matching a standard genealogy-chart layout.
function layout(node: TreeNode, depth: number, leafIndex: { value: number }): Positioned {
  const kids = node.children || [];
  if (kids.length === 0) {
    const x = leafIndex.value * SPACING_X + SPACING_X / 2;
    leafIndex.value += 1;
    return { node, x, y: depth * LEVEL_HEIGHT + TOP_MARGIN, children: [] };
  }
  const children = kids.map((child) => layout(child, depth + 1, leafIndex));
  const x = (children[0].x + children[children.length - 1].x) / 2;
  return { node, x, y: depth * LEVEL_HEIGHT + TOP_MARGIN, children };
}

function countLeaves(node: TreeNode): number {
  const kids = node.children || [];
  if (kids.length === 0) return 1;
  return kids.reduce((sum, c) => sum + countLeaves(c), 0);
}

function maxDepth(node: TreeNode): number {
  const kids = node.children || [];
  if (kids.length === 0) return 0;
  return 1 + Math.max(...kids.map(maxDepth));
}

function collectConnectors(pos: Positioned, out: string[]) {
  if (pos.children.length === 0) return;
  // Start the stem below the parent's full text block (not just its
  // circle), so the line never runs through the name/note labels.
  const textBottom = pos.y + CIRCLE_R + TEXT_BLOCK;
  const busY = textBottom + STEM_GAP;
  out.push(`M ${pos.x} ${textBottom} L ${pos.x} ${busY}`);
  if (pos.children.length > 1) {
    const xs = pos.children.map((c) => c.x);
    out.push(`M ${Math.min(...xs)} ${busY} L ${Math.max(...xs)} ${busY}`);
  }
  for (const child of pos.children) {
    out.push(`M ${child.x} ${busY} L ${child.x} ${child.y - CIRCLE_R}`);
    collectConnectors(child, out);
  }
}

function flattenNodes(pos: Positioned, out: Positioned[]) {
  out.push(pos);
  pos.children.forEach((c) => flattenNodes(c, out));
}

const DEFAULT_TREE: TreeNode = {
  label: 'Coffea',
  note: 'the coffee genus',
  icon: '🌍',
  children: [
    {
      label: 'Coffea arabica',
      note: 'Ethiopia, 1,000+ yrs ago',
      color: '#a0785a',
      icon: '🌱',
      children: [
        { label: 'Typica', note: 'Amsterdam → Martinique, 1723', color: '#a0785a', icon: '☕' },
        { label: 'Bourbon', note: 'via Réunion Island', color: '#a0785a', icon: '☕' },
      ],
    },
    {
      label: 'Coffea canephora',
      note: 'Robusta — Congo Basin, 1890s',
      color: '#6b3410',
      icon: '🫘',
    },
  ],
};
const DEFAULT_EYEBROW = 'Family tree';
const DEFAULT_CAPTION = '';

export default function FamilyTree({
  tree,
  eyebrow,
  caption,
}: {
  tree?: string;
  eyebrow?: string;
  caption?: string;
}) {
  const root: TreeNode = tree ? JSON.parse(tree) : DEFAULT_TREE;
  const positioned = layout(root, 0, { value: 0 });

  const leaves = countLeaves(root);
  const depth = maxDepth(root);
  const width = leaves * SPACING_X;
  const height = depth * LEVEL_HEIGHT + TOP_MARGIN + CIRCLE_R + TEXT_BLOCK + 20;

  const connectors: string[] = [];
  collectConnectors(positioned, connectors);
  const allNodes: Positioned[] = [];
  flattenNodes(positioned, allNodes);

  return (
    <div className="not-prose bg-[#1c1d20] border border-white/10 rounded-lg p-6 my-6">
      <p className="text-xs uppercase tracking-wide text-white/40 mb-1">{eyebrow || DEFAULT_EYEBROW}</p>
      {(caption || DEFAULT_CAPTION) && (
        <p className="text-white/70 text-sm mb-4">{caption || DEFAULT_CAPTION}</p>
      )}

      <div className="bg-black/30 rounded-lg overflow-x-auto">
        <div className="relative" style={{ width, height, minWidth: '100%' }}>
          <svg width={width} height={height} className="absolute inset-0">
            {connectors.map((d, i) => (
              <path key={i} d={d} stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} fill="none" />
            ))}
          </svg>

          {allNodes.map((p, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{ left: p.x, top: p.y - CIRCLE_R, transform: 'translateX(-50%)', width: SPACING_X - 20 }}
            >
              <div
                className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: CIRCLE_D,
                  height: CIRCLE_D,
                  background: `${p.node.color || '#0aee3c'}33`,
                  border: `2px solid ${p.node.color || '#0aee3c'}`,
                  fontSize: 26,
                }}
              >
                {p.node.icon || '☕'}
              </div>
              <p className="text-xs font-bold text-center mt-2 leading-tight" style={{ color: p.node.color || '#0aee3c' }}>
                {p.node.label}
              </p>
              {p.node.note && <p className="text-[10px] text-white/40 text-center mt-0.5 leading-tight">{p.node.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
