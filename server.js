// server.js
require("dotenv").config();

const FIRST_LEVEL_COMMISSION = parseInt(process.env.FIRST_LEVEL_COMMISSION);
const SECOND_LEVEL_COMMISSION = parseInt(process.env.SECOND_LEVEL_COMMISSION);

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const dev = process.env.NODE_ENV !== 'production';
console.log("DEV", dev);
const app = next({ dev });
const handle = app.getRequestHandler();



const User = require('./src/db/models/User');
const Frens = require('./src/db/models/Frens');
const Tasks = require('./src/db/models/Tasks');
const Cards = require('./src/db/models/Cards');
const Mining = require('./src/db/models/Mining');
const UserTasks = require('./src/db/models/UserTasks');
const TaskStats = require('./src/db/models/TaskStats');


mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

//dummy data
const TEST_INIT_DATA = {
    user: {
        id: 123456,
        username: "testUser",
        isPremium: true,
        firstName: "Test",
        lastName: "User",
    }
}


//Functions
const updateReward = async (telegramId, reward, collect = false) => {
    const user = await User.findOne({ telegramId: telegramId });
    const userFirstSponsor = await User.findOne({ telegramId: user.ref });
    const userSecondSponsor = await User.findOne({ telegramId: userFirstSponsor.ref });
    user.coin += reward;
    if (collect) {
        user.lastLogin = new Date();
    }
    await user.save();

    console.log("User earned", reward, "coins");

    if (userFirstSponsor) {
        userFirstSponsor.coin += reward * FIRST_LEVEL_COMMISSION / 100;
        await userFirstSponsor.save();
        const firstRef = await Frens.findOne({ ref: userFirstSponsor.telegramId, telegramId: telegramId, level: 1 });
        firstRef.reward += reward * FIRST_LEVEL_COMMISSION / 100;
        await firstRef.save();
        console.log("First sponsor earned", reward * FIRST_LEVEL_COMMISSION / 100, "coins");
    }
    if (userSecondSponsor) {
        userSecondSponsor.coin += reward * SECOND_LEVEL_COMMISSION / 100;
        await userSecondSponsor.save();
        const secondRef = await Frens.findOne({ ref: userSecondSponsor.telegramId, telegramId: telegramId, level: 2 });
        secondRef.reward += reward * SECOND_LEVEL_COMMISSION / 100;
        await secondRef.save();
        console.log("Second sponsor earned", reward * SECOND_LEVEL_COMMISSION / 100, "coins");
    }


}

const checkTelegramFollow = async (telegramId, chatId) => {
    try {
        const botURL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember?chat_id=${chatId}&user_id=${telegramId}`;
        const response = await fetch(botURL);
        const data = await response.json();
        console.log(data);
        if (data.result.status == "member" || data.result.status == "administrator" || data.result.status == "creator") {
            return true;
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}




app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Socket.IO sunucusunu HTTP sunucusuna bağla
    const io = new Server(httpServer, {
        cors: { origin: true, credentials: true },
    });

    io.use(async (socket, next) => {



        console.log(`${process.env.NEXT_PUBLIC_TEST === "true" ? "Running on TEST mode" : "Running on PROD mode"}`);

        const initData = process.env.NEXT_PUBLIC_TEST === "true" ?
            TEST_INIT_DATA :
            socket.handshake.auth.initData;

        if (!initData) return next();

        const telegramId = initData.user.id;
        const username = initData.user.username || initData.user.firstName;
        const ref = initData.startParam || null;
        const premium = initData.user.isPremium;
        const fullname = initData.user.firstName + " " + initData.user.lastName;

        socket.telegramId = telegramId;
        socket.username = username;

        const isUserExists = await User.findOne({ telegramId: telegramId });


        if (!isUserExists) {
            await User.create({ telegramId: telegramId, username: username, ref: ref, premium: premium, fullname: fullname });
            const firstLevel = await User.findOne({ telegramId: ref });
            if (firstLevel) {
                //register first level user
                await Frens.create({
                    telegramId: telegramId,
                    username: username,
                    ref: ref,
                    reward: 0,
                    level: 1,
                })
                const secondLevel = await User.findOne({ telegramId: firstLevel.ref });
                if (secondLevel) {
                    //register second level user
                    await Frens.create({
                        telegramId: telegramId,
                        username: username,
                        ref: secondLevel.telegramId,
                        reward: 0,
                        level: 2,
                    })

                }
            }
        }


        next();
    });

    io.on('connection', (socket) => {

        if (!socket.telegramId) return;

        console.log('User connected:', {
            username: socket.username,
            telegramId: socket.telegramId
        });

        // Increment online count when user connects
        io.engine.clientsCount;

        socket.on('getUser', async () => {
            const user = await User.findOne({ telegramId: socket.telegramId });
            socket.emit('user', user);
        });

        socket.on('getFrens', async () => {
            const frens = await Frens.find({ ref: socket.telegramId });
            socket.emit('frens', {
                frens: frens
            });
        });

        socket.on('getCards', async () => {
            const cards = await Cards.find({});
            socket.emit('cards', {
                cards: cards

            });
        });

        socket.on('getMining', async () => {
            const miningCards = await Mining.find({});
            socket.emit('mining', {
                miningCards: miningCards,
            });
        });

        socket.on('getTasks', async () => {
            const tasks = await Tasks.find({});
            const userTasks = await UserTasks.find({ telegramId: socket.telegramId });


            tasks.forEach(task => {
                //task.taskId userTask'da varsa task.state = userTask.status
                const userTask = userTasks.find(userTask => userTask.taskId === task.taskId);
                if (userTask) {
                    task.state = userTask.status;
                    console.log(task.taskId, userTask.status);
                } else {

                }
                task.subTasks.forEach(subTask => {
                    const userSubTask = userTasks.find(userTask => userTask.taskId === subTask.taskId);
                    if (userSubTask) {
                        subTask.state = userSubTask.status;
                        console.log(subTask.taskId, userSubTask.status);
                    }
                });
            });


            socket.emit('tasks', {
                tasks: tasks
            });
        });

        socket.on('getUserTasks', async () => {
            const userTasks = await UserTasks.find({ telegramId: socket.telegramId });
            socket.emit('userTasks', {
                userTasks: userTasks
            });
        });

        socket.on('spinReward', async (data) => {
            await updateReward(socket.telegramId, data.reward);
            const user = await User.findOne({ telegramId: socket.telegramId });
            user.spin--;
            user.totalSpin++;
            await user.save();
            socket.emit('user', user);
        });

        socket.on('updateCoin', async (data) => {
            await updateReward(socket.telegramId, data);
            const user = await User.findOne({ telegramId: socket.telegramId });
            socket.emit('user', user);
        });

        socket.on('collect', async (data) => {
            await updateReward(socket.telegramId, data, true);
            const user = await User.findOne({ telegramId: socket.telegramId });
            socket.emit('user', user);
        });

        socket.on('buyCard', async (data) => {
            console.log('buyCard', data);
            const user = await User.findOne({ telegramId: socket.telegramId });
            user.coin -= data.price;
            user.hourlyEarn += data.perHour;
            user.cards.push(data);
            await user.save();
            socket.emit('user', user);
        });

        socket.on('taskStart', async (data) => {

            await UserTasks.create({
                telegramId: socket.telegramId,
                taskId: data.taskId,
                reward: data.value,
                isMainTask: data.isMainTask,
                isTelegramFollow: data.isTelegramFollow,
                status: data.telegramFollow == true ? "check" : "done"
            });


            if (data.telegramFollow == false) {
                await updateReward(socket.telegramId, data.value);
                const user = await User.findOne({ telegramId: socket.telegramId });
                user.tasks.push(data.taskId);
                await user.save();

                // Check if TaskStats record exists and update it, or create new one
                const existingTaskStats = await TaskStats.findOne({ taskId: data.taskId });
                if (existingTaskStats) {
                    existingTaskStats.reward += data.value;
                    existingTaskStats.count += 1;
                    await existingTaskStats.save();
                } else {
                    await TaskStats.create({
                        taskId: data.taskId,
                        reward: data.value,
                        count: 1,
                        taskName: data.name
                    });
                }
            } else {
                console.log("telegramFollow", data.telegramChatId);
            }
            const userTasks = await UserTasks.find({ telegramId: socket.telegramId });
            const user = await User.findOne({ telegramId: socket.telegramId });
            const tasks = await Tasks.find({});
            //taskların ve subTaskların statuslarını userTasks'a göre güncelle
            tasks.forEach(task => {
                //task.taskId userTask'da varsa task.state = userTask.status
                const userTask = userTasks.find(userTask => userTask.taskId === task.taskId);
                if (userTask) {
                    task.state = userTask.status;
                    console.log(task.taskId, userTask.status);
                } else {

                }
                task.subTasks.forEach(subTask => {
                    const userSubTask = userTasks.find(userTask => userTask.taskId === subTask.taskId);
                    if (userSubTask) {
                        subTask.state = userSubTask.status;
                        console.log(subTask.taskId, userSubTask.status);
                    }
                });
            });
            socket.emit('tasks', {
                tasks: tasks
            });
            socket.emit('user', user);

        });

        socket.on('taskCheck', async (data) => {
            console.log('taskCheck', data);
            //telegramId li kullanıcı kanala abone mi değil mi kontrol et
            const isFollow = await checkTelegramFollow(socket.telegramId, data.telegramChatId);
            if (isFollow) {
                await UserTasks.updateOne({ taskId: data.taskId, telegramId: socket.telegramId }, { status: "done" });
                await updateReward(socket.telegramId, data.value);
                const user = await User.findOne({ telegramId: socket.telegramId });
                user.tasks.push(data.taskId);
                await user.save();

                const existingTaskStats = await TaskStats.findOne({ taskId: data.taskId });
                if (existingTaskStats) {
                    existingTaskStats.reward += data.value;
                    existingTaskStats.count += 1;
                    await existingTaskStats.save();
                } else {
                    await TaskStats.create({
                        taskId: data.taskId,
                        reward: data.value,
                        count: 1,
                        taskName: data.name
                    });
                }
            } else {
                //TODO if not follow remove task.
                await UserTasks.deleteOne({ taskId: data.taskId, telegramId: socket.telegramId });
            }

            const userTasks = await UserTasks.find({ telegramId: socket.telegramId });
            const tasks = await Tasks.find({});
            //taskların ve subTaskların statuslarını userTasks'a göre güncelle
            tasks.forEach(task => {
                //task.taskId userTask'da varsa task.state = userTask.status
                const userTask = userTasks.find(userTask => userTask.taskId === task.taskId);
                if (userTask) {
                    task.state = userTask.status;
                    console.log(task.taskId, userTask.status);
                } else {

                }
                task.subTasks.forEach(subTask => {
                    const userSubTask = userTasks.find(userTask => userTask.taskId === subTask.taskId);
                    if (userSubTask) {
                        subTask.state = userSubTask.status;
                        console.log(subTask.taskId, userSubTask.status);
                    }
                });
            });
            const user = await User.findOne({ telegramId: socket.telegramId });
            socket.emit('tasks', {
                tasks: tasks
            });
            socket.emit('user', user);
        });




        socket.on('disconnect', () => {
            console.log('User disconnected:', {
                username: socket.username,
                telegramId: socket.telegramId
            });
        });
    });


    setInterval(() => {
        // Get real-time count of connected clients
        const onlineCount = io.engine.clientsCount;
        io.emit("online", { online: onlineCount });
    }, 1000);

    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Sunucu 3000 portunda çalışıyor!');
    });
});





