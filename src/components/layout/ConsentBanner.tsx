import { useState } from 'react';
import { Button } from '../ui/Button';
import { getConsent, acceptConsent, declineConsent } from '../../lib/analytics';

export function ConsentBanner() {
  const [visible, setVisible] = useState(() => getConsent() === null);

  if (!visible) return null;

  function handleAccept() {
    acceptConsent();
    setVisible(false);
  }

  function handleDecline() {
    declineConsent();
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-deep border-t border-line-soft">
      <div className="max-w-[1080px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-ink-dim text-[13px] max-w-[60ch]">
          This site uses Google Analytics to see how it's used — page views and time on page, no
          accounts, no personal data collected beyond that. It only runs if you accept.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="default" onClick={handleDecline}>
            Decline
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
