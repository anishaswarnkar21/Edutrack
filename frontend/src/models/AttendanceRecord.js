export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
});

export class AttendanceRecord {
  constructor({ _id, class: classId, student, date, status }) {
    this.id = _id;
    this.classId = classId;
    this.student = student;
    this.date = date;
    this.status = status;
  }

  static fromApi(data) {
    return new AttendanceRecord(data);
  }
}
