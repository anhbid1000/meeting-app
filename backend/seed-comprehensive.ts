import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

// Import models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

import Workspace from './src/models/Workspace.model';
import Channel from './src/models/Channel.model';
import ChannelMember from './src/models/ChannelMember.model';
import ChannelJoinRequest from './src/models/ChannelJoinRequest.model';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('🔗 MongoDB connected\n');

    // ============ STEP 1: Clear all data ============
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      Channel.deleteMany({}),
      ChannelMember.deleteMany({}),
      ChannelJoinRequest.deleteMany({}),
    ]);
    console.log('🗑️  Cleared old data\n');

    // ============ STEP 2: Create Users ============
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const alice = await User.create({
      email: 'alice@example.com',
      name: 'Alice (Owner)',
      role: 'owner',
      password: hashedPassword,
    });

    const bob = await User.create({
      email: 'bob@example.com',
      name: 'Bob (Admin)',
      role: 'admin',
      password: hashedPassword,
    });

    const carol = await User.create({
      email: 'carol@example.com',
      name: 'Carol (Member)',
      role: 'member',
      password: hashedPassword,
    });

    const david = await User.create({
      email: 'david@example.com',
      name: 'David (Member)',
      role: 'member',
      password: hashedPassword,
    });

    console.log('👥 Created 4 users:');
    console.log(`   - ${alice.email} (${alice._id})`);
    console.log(`   - ${bob.email} (${bob._id})`);
    console.log(`   - ${carol.email} (${carol._id})`);
    console.log(`   - ${david.email} (${david._id})\n`);

    // ============ STEP 3: Create Multiple Workspaces ============
    // Carol (test user) sẽ là member của 3 workspace khác nhau
    
    // Workspace 1: Tech Company (Carol là member)
    const ws1 = await Workspace.create({
      name: 'Tech Company',
      description: 'Main workspace for tech team',
      slug: 'tech-company',
      ownerId: alice._id,
      members: [alice._id, bob._id, carol._id],
      plan: 'pro',
      channelCount: 0,
    });

    // Workspace 2: Design Studio (Carol là member)
    const ws2 = await Workspace.create({
      name: 'Design Studio',
      description: 'Creative workspace for designers',
      slug: 'design-studio',
      ownerId: bob._id,
      members: [bob._id, carol._id, david._id],
      plan: 'standard',
      channelCount: 0,
    });

    // Workspace 3: Startup Hub (Carol là member)
    const ws3 = await Workspace.create({
      name: 'Startup Hub',
      description: 'Collaborative space for startups',
      slug: 'startup-hub',
      ownerId: alice._id,
      members: [alice._id, carol._id],
      plan: 'standard',
      channelCount: 0,
    });

    console.log('🏢 Created 3 workspaces:');
    console.log(`   - ${ws1.name} (${ws1._id}) - slug: ${ws1.slug}`);
    console.log(`   - ${ws2.name} (${ws2._id}) - slug: ${ws2.slug}`);
    console.log(`   - ${ws3.name} (${ws3._id}) - slug: ${ws3.slug}\n`);

    // ============ STEP 4: Create Channels for each Workspace ============
    
    // Workspace 1: Tech Company - 8 channels (đa dạng)
    const ws1Channels = [
      {
        name: 'General',
        slug: 'general',
        description: 'Company-wide announcements and discussions',
        type: 'public' as const,
        category: 'General',
        createdBy: alice._id,
        members: [alice._id, bob._id, carol._id],
        memberCount: 3,
      },
      {
        name: 'Engineering',
        slug: 'engineering',
        description: 'Technical discussions and code reviews',
        type: 'public' as const,
        category: 'Development',
        createdBy: alice._id,
        members: [alice._id, carol._id],
        memberCount: 2,
      },
      {
        name: 'Product',
        slug: 'product',
        description: 'Product roadmap and feature planning',
        type: 'public' as const,
        category: 'Product',
        createdBy: bob._id,
        members: [alice._id, bob._id, carol._id],
        memberCount: 3,
      },
      {
        name: 'Leadership',
        slug: 'leadership',
        description: 'Private channel for leadership team',
        type: 'private' as const,
        category: 'Management',
        createdBy: alice._id,
        members: [alice._id, bob._id],
        memberCount: 2,
      },
      {
        name: 'Random',
        slug: 'random',
        description: 'Off-topic discussions and fun',
        type: 'public' as const,
        category: 'Social',
        createdBy: bob._id,
        members: [alice._id, bob._id, carol._id],
        memberCount: 3,
      },
      {
        name: 'Backend Team',
        slug: 'backend-team',
        description: 'Backend development coordination',
        type: 'private' as const,
        category: 'Development',
        createdBy: alice._id,
        members: [alice._id, carol._id],
        memberCount: 2,
      },
      {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Marketing campaigns and strategies',
        type: 'public' as const,
        category: 'Marketing',
        createdBy: bob._id,
        members: [bob._id],
        memberCount: 1,
      },
      {
        name: 'Old Project',
        slug: 'old-project',
        description: 'Archived project from 2025',
        type: 'public' as const,
        category: 'Development',
        createdBy: alice._id,
        members: [alice._id],
        memberCount: 1,
        isArchived: true,
      },
    ];

    // Workspace 2: Design Studio - 5 channels
    const ws2Channels = [
      {
        name: 'Design Reviews',
        slug: 'design-reviews',
        description: 'Share and critique design work',
        type: 'public' as const,
        category: 'Design',
        createdBy: bob._id,
        members: [bob._id, carol._id, david._id],
        memberCount: 3,
      },
      {
        name: 'Client Projects',
        slug: 'client-projects',
        description: 'Private client work discussions',
        type: 'private' as const,
        category: 'Projects',
        createdBy: bob._id,
        members: [bob._id, carol._id],
        memberCount: 2,
      },
      {
        name: 'Resources',
        slug: 'resources',
        description: 'Design resources and inspiration',
        type: 'public' as const,
        category: 'Resources',
        createdBy: david._id,
        members: [bob._id, carol._id, david._id],
        memberCount: 3,
      },
      {
        name: 'Feedback',
        slug: 'feedback',
        description: 'Get feedback on your work',
        type: 'public' as const,
        category: 'Collaboration',
        createdBy: carol._id,
        members: [bob._id, carol._id, david._id],
        memberCount: 3,
      },
      {
        name: 'Admin Only',
        slug: 'admin-only',
        description: 'Studio administration',
        type: 'private' as const,
        category: 'Management',
        createdBy: bob._id,
        members: [bob._id],
        memberCount: 1,
      },
    ];

    // Workspace 3: Startup Hub - 4 channels
    const ws3Channels = [
      {
        name: 'Announcements',
        slug: 'announcements',
        description: 'Important startup updates',
        type: 'public' as const,
        category: 'General',
        createdBy: alice._id,
        members: [alice._id, carol._id],
        memberCount: 2,
      },
      {
        name: 'Brainstorming',
        slug: 'brainstorming',
        description: 'Ideas and innovation',
        type: 'public' as const,
        category: 'Innovation',
        createdBy: carol._id,
        members: [alice._id, carol._id],
        memberCount: 2,
      },
      {
        name: 'Investors',
        slug: 'investors',
        description: 'Private investor communications',
        type: 'private' as const,
        category: 'Finance',
        createdBy: alice._id,
        members: [alice._id],
        memberCount: 1,
      },
      {
        name: 'Community',
        slug: 'community',
        description: 'Connect with other startups',
        type: 'public' as const,
        category: 'Social',
        createdBy: alice._id,
        members: [alice._id, carol._id],
        memberCount: 2,
      },
    ];

    // Insert all channels
    const allChannels = [
      ...ws1Channels.map(ch => ({ ...ch, workspaceId: ws1._id, lastMessageAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) })),
      ...ws2Channels.map(ch => ({ ...ch, workspaceId: ws2._id, lastMessageAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) })),
      ...ws3Channels.map(ch => ({ ...ch, workspaceId: ws3._id, lastMessageAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) })),
    ];

    const channels = await Channel.insertMany(allChannels);

    console.log(`📁 Created ${channels.length} channels across 3 workspaces\n`);

    // ============ STEP 5: Create ChannelMembers ============
    const channelMembers = [];
    for (const channel of channels) {
      for (const memberId of channel.members) {
        channelMembers.push({
          channelId: channel._id,
          workspaceId: channel.workspaceId,
          userId: memberId,
          role: memberId.toString() === channel.createdBy.toString() ? 'owner' : 'member',
          joinedAt: new Date(),
          lastReadAt: new Date(),
          isMuted: false,
          isFavorite: Math.random() > 0.7,
        });
      }
    }

    await ChannelMember.insertMany(channelMembers);
    console.log(`👤 Created ${channelMembers.length} channel memberships\n`);

    // ============ STEP 6: Create Join Requests (Carol muốn join các private channels) ============
    const leadershipChannel = channels.find(ch => ch.slug === 'leadership');
    const adminOnlyChannel = channels.find(ch => ch.slug === 'admin-only');
    const investorsChannel = channels.find(ch => ch.slug === 'investors');

    const requests = [];
    if (leadershipChannel) {
      requests.push({
        channelId: leadershipChannel._id,
        workspaceId: leadershipChannel.workspaceId,
        senderId: carol._id,
        message: 'I would like to join the leadership discussions',
        status: 'pending',
        type: 'request',
      });
    }
    if (adminOnlyChannel) {
      requests.push({
        channelId: adminOnlyChannel._id,
        workspaceId: adminOnlyChannel.workspaceId,
        senderId: carol._id,
        message: 'Need access to admin channel',
        status: 'pending',
        type: 'request',
      });
    }

    if (requests.length > 0) {
      await ChannelJoinRequest.insertMany(requests);
      console.log(`📬 Created ${requests.length} pending join requests\n`);
    }

    // ============ STEP 7: Update workspace channel counts ============
    await Workspace.findByIdAndUpdate(ws1._id, { channelCount: ws1Channels.length });
    await Workspace.findByIdAndUpdate(ws2._id, { channelCount: ws2Channels.length });
    await Workspace.findByIdAndUpdate(ws3._id, { channelCount: ws3Channels.length });

    // ============ STEP 8: Generate JWT Tokens ============
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    console.log('🔑 JWT Tokens for testing:\n');
    
    const users = [
      { user: alice, label: 'Alice (Owner)' },
      { user: bob, label: 'Bob (Admin)' },
      { user: carol, label: 'Carol (Member) - USE THIS FOR TESTING' },
      { user: david, label: 'David (Member)' },
    ];

    for (const { user, label } of users) {
      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
        secret,
        { expiresIn: '7d' }
      );
      
      console.log(`${label} (${user.email}):`);
      console.log(`${token}\n`);
    }

    console.log('✅ Seed completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   - Users: 4`);
    console.log(`   - Workspaces: 3`);
    console.log(`   - Total Channels: ${channels.length}`);
    console.log(`     • Tech Company: ${ws1Channels.length} channels`);
    console.log(`     • Design Studio: ${ws2Channels.length} channels`);
    console.log(`     • Startup Hub: ${ws3Channels.length} channels`);
    console.log(`   - Carol is member of all 3 workspaces`);
    console.log(`   - Login: carol@example.com / admin123\n`);
    console.log('🎯 Test scenarios covered:');
    console.log('   ✓ Public channels (Carol is member)');
    console.log('   ✓ Private channels (Carol is member)');
    console.log('   ✓ Private channels (Carol NOT member - can request)');
    console.log('   ✓ Archived channels');
    console.log('   ✓ Multiple categories');
    console.log('   ✓ Different member counts');
    console.log('   ✓ Pending join requests\n');

  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
