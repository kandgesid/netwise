import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

const LINES = [
  { d: 'M40,120 L140,120', delay: 0.1 },
  { d: 'M140,120 L260,60', delay: 0.3 },
  { d: 'M140,120 L260,120', delay: 0.5 },
  { d: 'M140,120 L260,180', delay: 0.7 },
];

const NODES = [
  { cx: 40, cy: 120, r: 16, delay: 1.0, label: 'client', lx: 20, ly: 150 },
  { cx: 140, cy: 120, r: 20, delay: 1.1, label: 'firewall', lx: 118, ly: 152 },
  { cx: 260, cy: 60, r: 14, delay: 1.2, label: 'app server', lx: 245, ly: 42 },
  { cx: 260, cy: 120, r: 14, delay: 1.3, label: 'internal server', lx: 245, ly: 102 },
  { cx: 260, cy: 180, r: 14, delay: 1.4, label: 'internet site', lx: 245, ly: 202 },
];

export function Hero() {
  return (
    <section className="pt-22 pb-16 grid md:grid-cols-2 gap-12 items-center max-w-[1080px] mx-auto px-8">
      <div>
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-2.5">
          Network &amp; security fundamentals
        </div>
        <h1 className="font-mono font-bold text-[40px] leading-[1.15] mb-5 tracking-tight">
          Learn how traffic actually moves, by moving it yourself.
        </h1>
        <p className="text-ink-dim text-[17px] max-w-[46ch] mb-7">
          Netwise is a simulation, on purpose. A safe sandbox for people starting from zero, with no
          prior networking knowledge assumed. You build firewall rules, run simulated traffic through
          them, and see exactly why it passed or got blocked, without needing a real network or any
          risk of breaking one.
        </p>
        <a href="#ch1">
          <Button variant="primary">Start the learning path →</Button>
        </a>
      </div>
      <svg viewBox="0 0 400 240" className="w-full h-auto">
        {LINES.map((line, i) => (
          <motion.path
            key={i}
            d={line.d}
            stroke="var(--color-line)"
            strokeWidth={1.5}
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: line.delay, ease: 'easeInOut' }}
          />
        ))}
        {NODES.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: node.delay }}
          />
        ))}
        {NODES.map((node, i) => (
          <motion.text
            key={`label-${i}`}
            x={node.lx}
            y={node.ly}
            className="font-mono"
            fontSize={10}
            fill="var(--color-ink-faint)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: node.delay + 0.1 }}
          >
            {node.label}
          </motion.text>
        ))}
      </svg>
    </section>
  );
}
