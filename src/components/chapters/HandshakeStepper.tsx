import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { AutoLink } from '../../lib/autoLink';
import { SCENARIOS, type ScenarioMode } from '../../data/handshakeSteps';

const MODE_OPTIONS: { value: ScenarioMode; label: string }[] = [
  { value: 'passthrough', label: 'No decryption' },
  { value: 'forwardproxy', label: 'Forward proxy' },
  { value: 'inbound', label: 'Inbound inspection' },
];

type EchState = 'off' | 'on';
const ECH_OPTIONS: { value: EchState; label: string }[] = [
  { value: 'off', label: 'ECH off' },
  { value: 'on', label: 'ECH on' },
];

type KexState = 'static' | 'ecdhe';
const KEX_OPTIONS: { value: KexState; label: string }[] = [
  { value: 'static', label: 'Static RSA' },
  { value: 'ecdhe', label: 'ECDHE (PFS)' },
];

export function HandshakeStepper() {
  const [mode, setMode] = useState<ScenarioMode>('passthrough');
  const [i, setI] = useState(0);
  const [ech, setEch] = useState<EchState>('off');
  const [kex, setKex] = useState<KexState>('static');

  const scenario = SCENARIOS[mode];
  const echOn = mode === 'passthrough' && ech === 'on';
  const kexOn = mode === 'inbound' && kex === 'ecdhe';
  const activeSteps = kexOn && scenario.kexSteps ? scenario.kexSteps : scenario.steps;
  const step = activeSteps[i];
  const isLast = i === activeSteps.length - 1;
  const displayedBody = echOn && step.echBody ? step.echBody : step.body;
  const displayedNote = echOn && scenario.echNote
    ? scenario.echNote
    : kexOn && scenario.kexNote
      ? scenario.kexNote
      : scenario.note;

  function changeMode(next: ScenarioMode) {
    setMode(next);
    setI(0);
    setEch('off');
    setKex('static');
  }

  function changeKex(next: KexState) {
    setKex(next);
    setI(0);
  }

  return (
    <Card>
      <div className="mb-5">
        <label className="block font-mono text-xs text-ink-faint mb-1.5">Scenario</label>
        <Toggle options={MODE_OPTIONS} value={mode} onChange={changeMode} />
      </div>
      {mode === 'passthrough' && (
        <div className="mb-5 pl-3 border-l border-line-soft max-w-[200px]">
          <label className="block font-mono text-[10.5px] text-ink-faint mb-1">
            Encrypted Client Hello (ECH)
          </label>
          <Toggle options={ECH_OPTIONS} value={ech} onChange={setEch} />
        </div>
      )}
      {mode === 'inbound' && (
        <div className="mb-5 pl-3 border-l border-line-soft max-w-[220px]">
          <label className="block font-mono text-[10.5px] text-ink-faint mb-1">
            Server's key exchange
          </label>
          <Toggle options={KEX_OPTIONS} value={kex} onChange={changeKex} />
        </div>
      )}
      <div className="text-[13px] text-ink-faint leading-relaxed mb-5">
        <AutoLink text={displayedNote} />
      </div>

      <div className="relative h-[70px] flex justify-between items-start mb-6">
        {['CLIENT', 'FIREWALL', 'SERVER'].map((label, idx) => (
          <div key={label} className="w-[90px] text-center">
            <div className="font-mono text-[11px] text-ink-faint border border-line rounded-md py-2.5">
              ▢ {label}
            </div>
            <div className="text-xs text-ink-dim mt-1.5 font-mono">
              {idx === 0 ? 'you' : idx === 1 ? 'inspects' : 'destination'}
            </div>
          </div>
        ))}
        <motion.div
          className="absolute top-4 w-3 h-3 rounded-full bg-accent"
          style={{ boxShadow: '0 0 0 4px rgba(242,169,59,0.15)' }}
          animate={{ left: `${step.pos}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex gap-1 mb-6">
        {activeSteps.map((_, idx) => (
          <div
            key={idx}
            className={`h-[3px] flex-1 rounded-sm ${idx <= i ? 'bg-accent' : 'bg-line-soft'}`}
          />
        ))}
      </div>

      <div className="font-mono text-[11px] text-accent uppercase tracking-wide mb-1.5">{step.label}</div>
      <div className="text-lg font-semibold mb-2">{step.title}</div>
      <div className="text-ink-dim text-[14.5px] min-h-[70px]">
        <AutoLink text={displayedBody} />
        {mode === 'passthrough' && i === 1 && (
          <div className="mt-2 font-mono text-xs">
            {echOn ? (
              <span className="text-ink-faint">SNI: encrypted — not visible on the wire</span>
            ) : (
              <span className="text-ink-dim">SNI: portal.netwise-example.test</span>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-5">
        <Button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          className={i === 0 ? 'invisible' : ''}
        >
          ← Previous
        </Button>
        <Button
          variant="primary"
          onClick={() => setI((v) => (isLast ? 0 : v + 1))}
        >
          {isLast ? 'Restart ↺' : 'Next step →'}
        </Button>
      </div>
    </Card>
  );
}
