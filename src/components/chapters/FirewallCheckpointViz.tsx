import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type PacketKind = 'go' | 'stop';

const PACKETS: { type: PacketKind; delay: number }[] = [
  { type: 'go', delay: 0.0 },
  { type: 'stop', delay: 0.35 },
  { type: 'go', delay: 0.7 },
  { type: 'go', delay: 1.05 },
  { type: 'stop', delay: 1.4 },
];

function Packet({ type, delay }: { type: PacketKind; delay: number }) {
  const allowed = type === 'go';
  return (
    <motion.div
      className="absolute top-[58px] w-3.5 h-3.5 rounded-sm"
      style={{ background: 'var(--color-accent)' }}
      initial={{ left: '6%', opacity: 0 }}
      animate={
        allowed
          ? {
              left: ['6%', '48%', '48%', '90%', '90%'],
              opacity: [0, 1, 1, 1, 0],
              background: [
                'var(--color-accent)',
                'var(--color-accent)',
                'var(--color-success)',
                'var(--color-success)',
                'var(--color-success)',
              ],
            }
          : {
              left: ['6%', '48%', '48%'],
              opacity: [0, 1, 1, 0],
              background: ['var(--color-accent)', 'var(--color-accent)', 'var(--color-danger)', 'var(--color-danger)'],
            }
      }
      transition={{
        duration: allowed ? 2.2 : 1.5,
        delay,
        times: allowed ? [0, 0.1, 0.5, 0.95, 1] : [0, 0.15, 0.7, 1],
        ease: 'easeInOut',
      }}
    >
      {!allowed && (
        <motion.span
          className="absolute -left-1 -top-1 text-danger font-bold text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 1.0, duration: 0.2 }}
        >
          ✕
        </motion.span>
      )}
    </motion.div>
  );
}

export function FirewallCheckpointViz() {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <Card>
      <h3 className="font-mono text-sm text-ink-dim uppercase tracking-wide mb-4 font-medium">
        Traffic passing the checkpoint
      </h3>
      <div className="relative h-[130px] flex justify-between items-center overflow-hidden">
        <div className="w-[130px] text-center font-mono text-[11px] text-ink-faint border border-dashed border-line-soft rounded-md py-3.5 px-1.5">
          Trusted network
        </div>
        <div className="w-[60px] text-center text-xl text-accent border border-line rounded-lg py-3 px-1 bg-bg-deep z-[2]">
          ▢
          <div className="font-mono text-[10px]">FIREWALL</div>
        </div>
        <div className="w-[130px] text-center font-mono text-[11px] text-ink-faint border border-dashed border-line-soft rounded-md py-3.5 px-1.5">
          Internet
        </div>
        <div key={replayKey} className="absolute inset-0">
          {PACKETS.map((p, i) => (
            <Packet key={i} type={p.type} delay={p.delay} />
          ))}
        </div>
      </div>
      <div className="text-center mt-4">
        <Button onClick={() => setReplayKey((k) => k + 1)}>Replay ↺</Button>
      </div>
    </Card>
  );
}
