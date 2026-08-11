export class ClassRoom {
  constructor({ _id, className, teacher, joinCode, createdAt }) {
    this.id = _id;
    this.className = className;
    this.teacher = teacher;
    this.joinCode = joinCode;
    this.createdAt = createdAt;
  }

  static fromApi(data) {
    return new ClassRoom(data);
  }
}
