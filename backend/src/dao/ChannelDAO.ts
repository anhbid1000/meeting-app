import { Model, Types } from 'mongoose';
import Channel, { IChannel } from '../models/Channel.model';
import { BaseDAO } from './BaseDAO';

export class ChannelDAO extends BaseDAO<IChannel> {
  constructor() {
    super(Channel);
  }

  async findByWorkspaceId(workspaceId: string) {
    return this.model.find({ workspaceId: new Types.ObjectId(workspaceId) }).lean();
  }

  async findBySlug(workspaceId: string, slug: string) {
    return this.model.findOne({ 
      workspaceId: new Types.ObjectId(workspaceId), 
      slug 
    }).lean();
  }
}

export default new ChannelDAO();
