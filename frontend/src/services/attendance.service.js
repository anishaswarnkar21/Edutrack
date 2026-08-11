import apiClient from "./apiClient.js";
import { AttendanceRecord } from "../models/AttendanceRecord.js";

export const attendanceService = {
  async record(classId, { date, records }) {
    const { data } = await apiClient.post(`/classes/${classId}/attendance`, { date, records });
    return data.data.map(AttendanceRecord.fromApi);
  },

  async list(classId) {
    const { data } = await apiClient.get(`/classes/${classId}/attendance`);
    return data.data.map(AttendanceRecord.fromApi);
  },
};
