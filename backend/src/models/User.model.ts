import bcrypt from "bcryptjs";
import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { AppRole, WorkspaceRole } from "../types";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: AppRole;
  workspaces: {
    workspaceId: Types.ObjectId;
    role: WorkspaceRole;
  }[];
  refreshTokens: {
    tokenHash: string;
    userAgent?: string;
    expiresAt: Date;
    createdAt: Date;
  }[];
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const workspaceMembershipSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "owner", "member"],
      default: "member",
      required: true,
    },
  },
  { _id: false }
);

const refreshTokenSchema = new Schema(
  {
    tokenHash: {
      type: String,
      required: true,
    },
    userAgent: String,
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email khong hop le"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    workspaces: {
      type: [workspaceMembershipSchema],
      default: [],
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ "workspaces.workspaceId": 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
