// components/ThreeDPanelImage.jsx
"use client";

// 3D split-panel image (pure CSS). Works anywhere.
// Props:
//   src     - image url
//   panels  - [{k, dx, dz}] widths/offsets (optional)
//   w       - width (CSS unit, default '28vmin')
//   h       - height (CSS unit, default '22vmin')
//   f       - mid-line factor (default 0.25)

export default function ThreeDPanelImage({
  src,
  panels = [
    { k: 1, dx: 0, dz: -0.2 },
    { k: 2, dx: -0.1 },
    { k: 1, dx: 0.1 },
  ],
  w = "28vmin",
  h = "22vmin",
  f = 0.25,
}) {
  const sum = panels.reduce((a, c) => a + c.k, 0);
  let cum = 0;
  const norm = panels.map((p, i, a) => {
    const k = +(p.k / sum).toFixed(3);
    const item = {
      ...p,
      k,
      p: +cum.toFixed(3),
      dx: (i ? a[i - 1].dx : 0) + (p.dx || 0),
      dz: p.dz || 0,
    };
    cum += k;
    return item;
  });

  const dxTotal = norm[norm.length - 1].dx;

  return (
    <div
      className="img3d"
      style={{
        // component variables
        "--w": w,
        "--h": h,
        "--f": f,
        "--bg": `url('${src}')`,
      }}
    >
      <div className="assembly" style={{ "--dx": dxTotal }}>
        {norm.map((c, i) => (
          <div
            key={i}
            className="panel"
            style={{
              "--i": i,
              "--k": c.k,
              "--p": c.p,
              "--dx": c.dx,
              "--dz": c.dz,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .img3d {
          position: relative;
          width: var(--w);
          height: var(--h);
          perspective: 125vmin;
          filter: drop-shadow(-1vmin 1vmin 1vmin #0003);
          overflow: visible;
        }
        .assembly {
          position: absolute;
          top: 50%;
          left: calc(50% - 0.5 * var(--dx) * var(--w));
          transform: rotateY(35deg);
          transform-style: preserve-3d;
        }
        .panel {
          position: absolute;
          transform-style: preserve-3d;
          --mid: calc((var(--p) + var(--k) * var(--f)) * var(--w));
          transform: translate3d(
            calc(var(--dx) * var(--w)),
            0,
            calc(var(--dz) * var(--w))
          );
        }
        .panel::before,
        .panel::after {
          position: absolute;
          content: "";
          margin: calc(-0.5 * var(--h)) calc(-0.5 * var(--w));
          width: var(--w);
          height: var(--h);
          background-image: var(--bg);
          background-position: 50% 50%;
          background-size: cover;
        }
        .panel::before {
          transform-origin: var(--mid);
          transform: rotateY(-90deg);
          clip-path: inset(0 calc(100% - var(--mid)) 0 calc(var(--p) * 100%));
          filter: brightness(0.4);
        }
        .panel::after {
          clip-path: inset(
            0 calc(100% - (var(--p) + var(--k)) * var(--w)) 0 var(--mid)
          );
        }
      `}</style>
    </div>
  );
}
