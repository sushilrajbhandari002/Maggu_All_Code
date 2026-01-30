import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SubjectAttributes {
  id: number;
  name: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type SubjectCreationAttributes = Optional<SubjectAttributes, 'id' | 'isActive'>;

export class Subject
  extends Model<SubjectAttributes, SubjectCreationAttributes>
  implements SubjectAttributes
{
  public id!: number;
  public name!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subject.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'subjects',
  }
);

