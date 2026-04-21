export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function getAttendanceLogTypeLabel(value: string) {
  switch (value) {
    case "clock_in":
      return "出勤";
    case "clock_out":
      return "退勤";
    case "break_start":
      return "休憩開始";
    case "break_end":
      return "休憩終了";
    default:
      return value;
  }
}

export function getAttendanceSourceLabel(value: string) {
  switch (value) {
    case "manual":
      return "手動";
    case "mobile":
      return "モバイル";
    case "web":
      return "Web";
    case "system":
      return "システム";
    default:
      return value;
  }
}

export function getWorkSessionStatusLabel(value: string) {
  switch (value) {
    case "draft":
      return "下書き";
    case "submitted":
      return "申請中";
    case "approved":
      return "承認済み";
    case "rejected":
      return "差戻し";
    default:
      return value;
  }
}

export function getBadgeVariantByStatus(value: string) {
  switch (value) {
    case "approved":
    case "clock_in":
    case "clock_out":
      return "success" as const;
    case "submitted":
      return "info" as const;
    case "rejected":
      return "danger" as const;
    case "break_start":
    case "break_end":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}
