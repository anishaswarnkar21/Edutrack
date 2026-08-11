export const ROLES = Object.freeze({
  TEACHER: "teacher",
  STUDENT: "student",
  ADMIN: "admin",
});

export class User {
  constructor({ id, name, email, role }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }

  get isTeacher() {
    return this.role === ROLES.TEACHER;
  }

  get isStudent() {
    return this.role === ROLES.STUDENT;
  }

  get isAdmin() {
    return this.role === ROLES.ADMIN;
  }

  static fromApi(data) {
    return new User(data);
  }
}
