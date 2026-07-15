const formatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
})

/** Format an ISO timestamp as `10 Mar 2018 10:19` */
export function formatTimestamp(iso: string): string {
  return formatter.format(new Date(iso)).replace(',', '')
}
