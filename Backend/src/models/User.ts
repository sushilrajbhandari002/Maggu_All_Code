import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string | null;
  address?: string | null;
  image?: string | null;
  username?: string | null;
  teacherId?: string | null;
  classTeacherOf?: string | null;
  assignedClasses?: string[] | null;
  class?: string | null;
  rollNumber?: string | null;
  needsPasswordChange: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'passwordHash' | 'needsPasswordChange'
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public email!: string;
  public passwordHash!: string;
  public role!: UserRole;
  public name!: string;
  public phone!: string | null;
  public address!: string | null;
  public image!: string | null;
  public username!: string | null;
  public teacherId!: string | null;
  public classTeacherOf!: string | null;
  public assignedClasses!: string[] | null;
  public class!: string | null;
  public rollNumber!: string | null;
  public needsPasswordChange!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'student'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    image: DataTypes.STRING,
    username: DataTypes.STRING,
    teacherId: DataTypes.STRING,
    classTeacherOf: DataTypes.STRING,
    assignedClasses: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    class: DataTypes.STRING,
    rollNumber: DataTypes.STRING,
    needsPasswordChange: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

