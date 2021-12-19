import { formatDuration, intervalToDuration } from 'date-fns/esm';

export default function formatTimeSince(timeSince: Date) {
  let durationString = formatDuration(
    intervalToDuration({
      start: new Date(),
      end: timeSince,
    }),
    {
      delimiter: ' ',
      format: ['hours', 'minutes'],
    }
  );

  return (
    <>
      {/* {JSON.stringify(durationString)} */}
      {durationString.includes('hour')
        ? durationString.split(' ')[0] + ' hour ago'
        : durationString === ''
        ? 'Just now'
        : durationString.replace('minutes', 'mins') + ' ago'}
    </>
  );
}
