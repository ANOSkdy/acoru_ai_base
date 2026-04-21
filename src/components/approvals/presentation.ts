export function getApprovalStatusLabel(value: string) {
  switch (value) {
    case "pending":
      return "確認待ち";
    case "approved":
      return "承認済み";
    case "rejected":
      return "却下";
    default:
      return value;
  }
}

export function getApprovalTargetTypeLabel(value: string) {
  switch (value) {
    case "work_session":
      return "作業セッション";
    case "daily_report":
      return "日報";
    default:
      return value;
  }
}

export function getApprovalRequestTypeLabel(targetType: string) {
  switch (targetType) {
    case "work_session":
      return "作業セッション承認";
    case "daily_report":
      return "日報承認";
    default:
      return `${targetType} 承認`;
  }
}
