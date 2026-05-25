import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  slug: string;
  color: string;
  icon: string;
}> = [
    { name: "Công việc", slug: "work", color: "#3b82f6", icon: "work" },
    { name: "Thiết kế", slug: "design", color: "#ec4899", icon: "palette" },
    { name: "Cá nhân", slug: "personal", color: "#8b5cf6", icon: "person" },
    { name: "Gia đình", slug: "family", color: "#f97316", icon: "family_restroom" },
    { name: "Kỹ thuật", slug: "engineering", color: "#6366f1", icon: "code" },
    { name: "Marketing", slug: "marketing", color: "#14b8a6", icon: "campaign" },
    { name: "Game", slug: "game", color: "#22c55e", icon: "sports_esports" },
    { name: "Khác", slug: "other", color: "#64748b", icon: "category" },
  ];

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 60,
    },
    color: {
      type: String,
      default: "#6366f1", // indigo-500
      trim: true,
    }
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ name: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

export default Category;
