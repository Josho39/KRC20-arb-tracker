/* eslint-disable @typescript-eslint/no-explicit-any */
import TransactionTimeline from './TransactionTimeline';

export default function watcher() {
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <TransactionTimeline />
    </div>
  );
}
