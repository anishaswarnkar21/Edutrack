import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  questionText: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length === 4,
      message: "A question must have exactly 4 options.",
    },
  },
  correctAnswerIndex: { type: Number, required: true, min: 0, max: 3 },
});

export default mongoose.model("Question", questionSchema);
