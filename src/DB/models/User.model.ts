import { Schema, Types, models, model, HydratedDocument } from "mongoose";

export enum RoleEnum {
  user = "user",
  admin = "admin",
}
export enum GenderEnum {
  male = "male",
  female = "female",
}

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  gender: GenderEnum;
  role: RoleEnum;
  confirmedAt?: Date;
  confirmEmailOtp?: string;
  resetPasswordOtp?: string;
  createdAt: Date;
  updatedAt?: Date;
  changeCredentialsTime?: Date;
  profileImage?: string;
  tempProfileImage?: string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, required: true, minLength: 2, maxLength: 25 },
    email: { type: String, required: true, unique: true },
    confirmedAt: { type: Date },
    confirmEmailOtp: { type: String },
    password: { type: String, required: true },
    resetPasswordOtp: { type: String },
    phone: { type: String },
    address: { type: String },
    changeCredentialsTime: { type: Date },
    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
    profileImage: String,
    tempProfileImage: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const UserModel = models.User || model<IUser>("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>;
