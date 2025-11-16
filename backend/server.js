const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key-that-should-be-long';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = 'mongodb+srv://Nagavalleswari:Valli%40417@cluster0.kziz2gp.mongodb.net/mediumCloneDB?retryWrites=true&w=majority&appName=Cluster0';

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nerellanagavalleswari@gmail.com', // Replace with your dedicated app email
        pass: 'zlgu zpec xpjb kbbc'     // Replace with the 16-character app password from Google
    }
});


// --- Schemas and Models ---

const readingListSchema = new mongoose.Schema({
    name: { type: String, required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: '', maxLength: 160 },
    resetToken: String,
    resetTokenExpiry: Date,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readingLists: [readingListSchema]
});
const User = mongoose.model('User', userSchema);

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now }
});
// Add text index for searching content
postSchema.index({ title: 'text', content: 'text' });
const Post = mongoose.model('Post', postSchema);


// --- Auth Middleware ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};


// --- API Routes ---

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(409).json({ message: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            readingLists: [{ name: 'Reading list', posts: [] }]
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ userId: user._id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id, email: user.email, username: user.username });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with that email does not exist.' });
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save();
        const resetUrl = `http://localhost:5173?token=${resetToken}`;
        const mailOptions = { from: `Mediumish Support <${transporter.options.auth.user}>`, to: email, subject: 'Password Reset Request', text: `Click this link to reset your password: ${resetUrl}` };
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent.' });
    } catch (error) { res.status(500).json({ message: 'Error sending email' }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Token is invalid or has expired.' });
        user.password = await bcrypt.hash(newPassword, 12);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
        res.json({ message: 'Password has been updated successfully.' });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});


// POST ROUTES
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: 'Error fetching posts' }); }
});

// NEW: Search Posts
app.get('/api/posts/search', authMiddleware, async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }
    try {
        const posts = await Post.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } } // Optional: Sort by relevance
        )
        .populate('author', 'username')
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 }); // Sort by relevance then date
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Error searching posts' });
    }
});


app.post('/api/posts', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    try {
        const newPost = new Post({ title, content, author: req.user.userId });
        await newPost.save();
        const populatedPost = await Post.findById(newPost._id).populate('author', 'username');
        res.status(201).json(populatedPost);
    } catch (err) { res.status(500).json({ message: 'Error creating post' }); }
});

app.get('/api/posts/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username followers')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username' }
            });
        const currentUser = await User.findById(req.user.userId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        let isSaved = false;
        if (currentUser && currentUser.readingLists) {
            const defaultList = currentUser.readingLists.find(list => list.name === 'Reading list');
            if (defaultList) {
                isSaved = defaultList.posts.includes(post._id);
            }
        }

        res.json({
            ...post.toObject(),
            isLiked: post.likes.includes(req.user.userId),
            isSaved: isSaved,
        });
    } catch (err) { res.status(500).json({ message: 'Error fetching post' }); }
});

app.post('/api/posts/:id/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user.userId;
        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();
        res.json({ likes: post.likes });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/posts/:id/comment', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const newComment = { text: req.body.text, author: req.user.userId };
        post.comments.push(newComment);
        await post.save();
        const populatedPost = await Post.findById(req.params.id).populate({
             path: 'comments',
             populate: { path: 'author', select: 'username' }
        });
        res.status(201).json(populatedPost.comments);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});


// USER ROUTES
app.post('/api/users/:id/follow', authMiddleware, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.userId);

        if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });
        if (currentUser.following.includes(userToFollow._id)) {
            currentUser.following.pull(userToFollow._id);
            userToFollow.followers.pull(currentUser._id);
        } else {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }
        await currentUser.save();
        await userToFollow.save();
        res.json({ isFollowing: currentUser.following.includes(userToFollow._id) });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/posts/:id/save', authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.userId);
        const postId = req.params.id;
        
        let defaultList = currentUser.readingLists.find(list => list.name === 'Reading list');
        if (!defaultList) {
            currentUser.readingLists.push({ name: 'Reading list', posts: [] });
            defaultList = currentUser.readingLists[currentUser.readingLists.length - 1];
        }

        const isSaved = defaultList.posts.includes(postId);
        if (isSaved) {
            defaultList.posts.pull(postId);
        } else {
            defaultList.posts.push(postId);
        }
        await currentUser.save();
        res.json({ isSaved: !isSaved });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/users/profile/:userId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password -resetToken -resetTokenExpiry');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
    const { username, bio } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ message: 'Username already taken' });
            }
            user.username = username;
        }
        
        if (bio || bio === '') { // Allow setting bio to empty string
            user.bio = bio;
        }

        await user.save();
        
        const updatedUser = await User.findById(req.user.userId).select('-password -resetToken -resetTokenExpiry');
        const token = jwt.sign({ userId: updatedUser._id, email: updatedUser.email, username: updatedUser.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ user: updatedUser, token });

    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile' });
    }
});


app.get('/api/leaderboard', authMiddleware, async (req, res) => {
    try {
        const users = await User.aggregate([
            { $project: { username: 1, followerCount: { $size: "$followers" } } },
            { $sort: { followerCount: -1 } },
            { $limit: 10 }
        ]);
        res.json(users);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/users/library', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate({
                path: 'readingLists.posts',
                populate: { path: 'author', select: 'username' }
            });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.readingLists);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/users/lists', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.readingLists.push({ name: req.body.name, posts: [] });
        await user.save();
        res.status(201).json(user.readingLists);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const posts = await Post.find({ author: userId });
        const totalPosts = posts.length;
        const totalLikesReceived = posts.reduce((sum, post) => sum + post.likes.length, 0);
        
        const user = await User.findById(userId);
        const totalFollowers = user.followers.length;

        res.json({ totalPosts, totalLikesReceived, totalFollowers });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/notifications', authMiddleware, async (req, res) => {
    res.json([]);
});


// --- Function to Start Server ---
const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.error('Connection error', error);
        process.exit(1);
    }
};

startServer();

