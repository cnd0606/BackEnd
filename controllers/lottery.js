const jwt = require("jsonwebtoken");
const Lottery = require("../models/lottery");
const Ticket = require("../models/ticket");
const GLobalBalance = require("../models/globalBalance");
const User = require("../models/user");
const mongoose = require('mongoose');

exports.createLottery = async (req, res) => {
    try {
        const { fare, closingDate, firstPrize, secondPrize, thirdPrize } = req.body;
        const lottery = new Lottery({ fare, closingDate, firstPrize, secondPrize, thirdPrize, creationDate: new Date(), open: true });
        const result = await lottery.save();
        setTimeout(function () { console.log("Hello"); }, 10000);
        res.status(201).json({
            message: "Lotería creada satisfactoriamente",
            result: result
        });
        var totalPrize = firstPrize + secondPrize;
        const globalBalance = await GlobalBalance.find();
        const newValue = globalBalance[0].value - totalPrize;
        const editGlobalBalance = await GlobalBalance.updateOne({ _id: globalBalance[0]._id }, { value: newValue });
        if (editGlobalBalance.n > 0) {
            res.status(200).json({ message: 'Se desconto el dinero de los primeros premios al bolsillo de los administradores' });
        } else {
            res.status(500).json({
                message: "Error al descontar el dinero de los administradores",
            });
        };
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.closeLottery = async (req, res) => {
    try {
        const lottery = await Lottery.findById(req.params.id);
        const winningNumberOne = lottery.winningNumberOne; 
        const winningNumberTwo = lottery.winningNumberTwo; 
        const winningNumberThree = lottery.winningNumberThree; 
        const winningNumberFour = lottery.winningNumberFour; 
        const winningNumberFive = lottery.winningNumberFive;
        if  (lottery.closingDate >= Date.now()) {
            var totalThridPrize = 0;
            const ticket = await Ticket.find({ lotteryId: req.params.id }).toArray(function (result) {
                var count = 0;
                ticket.firstNumber === winningNumbers[0] ? count++ : count;
                ticket.secondNumber === winningNumbers[1] ? count++ : count;
                ticket.thirdNumber === winningNumbers[2] ? count++ : count;
                ticket.fourthNumber === winningNumbers[3] ? count++ : count;
                ticket.fifthNumber === winningNumbers[4] ? count++ : count;

                if (count === 5) {
                    firstPrizeWinners.push(ticket.userId);
                } else if (count === 4) {
                    secondPrizeWinners.push(ticket.userId);
                } else if (count === 3) {
                    thirdPrizeWinners.push(ticket.userId);
                }
               var ip1 = 0;
               firstPrizeWinners.forEach( async function(firstPrize){
                const user = await User.findById(firstPrizeWinners[ip1]);
                var newBalance = user.balance + (firstPrize/firstPrizeWinners.length); 
                const results = await User.updateOne({ _id: firstPrizeWinners[ip1]}, { balance: newBalance});
                ip1 = ip1 + 1;
             });
               var ip2 = 0;
               secondPrizeWinners.forEach( async function(secondPrize){
                const user = await User.findById(secondPrizeWinners[ip2]);
                var newBalance = user.balance + (secondPrize/secondPrizeWinners.length); 
                const results = await User.updateOne({ _id: secondPrizeWinners[ip2]}, { balance: newBalance});
                ip2 = ip2 + 1;
             });
             var ip3 = 0;
               thirdPrizeWinners.forEach( async function(thirdPrize){
                const user = await User.findById(thirdPrizeWinners[ip3]);
                var newBalance = user.balance + thirdPrize; 
                const results = await User.updateOne({ _id: secondPrizeWinners[ip3]}, { balance: newBalance});
                ip3 = ip3 + 1;
                totalThridPrize = totalThridPrize + thirdPrize
             });
            });

            firstPrizeWinners.forEach(async (userId) => {
                const user = await User.findById(userId);
                const newBalance = user.balance + (lottery.firstPrize / firstPrizeWinners.length);
                const updateUser = await User.updateOne({ _id: userId }, { balance: newBalance });
            });

            secondPrizeWinners.forEach(async (userId) => {
                const user = await User.findById(userId);
                var newBalance = user.balance + (lottery.secondPrize / secondPrizeWinners.length);
                const updateUser = await User.updateOne({ _id: userId }, { balance: newBalance });
            });

            thirdPrizeWinners.forEach(async (userId) => {
                const user = await User.findById(userId);
                var newBalance = user.balance + (lottery.thirdPrize / thirdPrizeWinners.length);
                const updateUser = await User.updateOne({ _id: userId }, { balance: newBalance });
            });

            const firstPrizeWinnersOId = firstPrizeWinners.map(userId => mongoose.Types.ObjectId(userId));
            const secondPrizeWinnersOId = secondPrizeWinners.map(userId => mongoose.Types.ObjectId(userId));
            const thirdPrizeWinnersOId = thirdPrizeWinners.map(userId => mongoose.Types.ObjectId(userId));

            const updateLottery = await Lottery
                .updateOne({ _id: lotteryId },
                    {
                        open: false,
                        winningNumbers: winningNumbers,
                        firstPrizeWinners: firstPrizeWinnersOId,
                        secondPrizeWinners: secondPrizeWinnersOId,
                        thirdPrizeWinners: thirdPrizeWinnersOId
                    });
            if (updateLottery.n > 0) {
                res.status(200).json({ message: 'Se cerro satisfactoriamente' });
            } else {
                res.status(500).json({
                    message: "closing lottery failed! 1",
                });
            }
        } else {
            res.status(500).json({
                message: "closing lottery failed! 2"
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err
        });
    }
};


exports.getLotteries = async (req, res) => {
    try {
        const lotteries = await Lottery.find();
        res.status(200).json({
            message: "Loterías encontradas satisfactoriamente",
            result: lotteries
        });
    } catch {
        res.status(500).json({
            message: "Fallo encontrando las loterías"
        });
    }
};


exports.getSelectedLottery = async (req, res) => {
    try {
        const lottery = await Lottery.findById(req.params.lotteryId);
        // asigna variables de la loteria seleccionada
        const id = lottery.id;
        const ticket = lottery.ticket;
        const fare = lottery.fare;
        const closingDate = lottery.closingDate;
        const creationDate = lottery.creationDate;
        const firstPrize = lottery.firstPrize;
        const secondPrize = lottery.secondPrize;
        const thirdPrize = lottery.thirdPrize;
        const open = lottery.open;
        const lotteryData = {
            id, ticket, fare, closingDate, creationDate, firstPrize, secondPrize,
            thirdPrize, open
        };
        res.status(200).json(lotteryData);
    } catch (err) {
        return res.status(401).json({
            message: "Error retrieving Lottery"
        });
    }
};

exports.editLottery = async (req, res) => {
    try {
        const { fare, closingDate, firstPrize, secondPrize, thirdPrize } = req.body;
        const result = await Lottery.updateOne({ _id: req.params.id },
            { fare: fare, closingDate: closingDate, firstPrize: firstPrize, secondPrize: secondPrize, thirdPrize: thirdPrize });
        if (result.n > 0) {
            res.status(200).json({ message: "Update successful!" });
        } else {
            res.status(401).json({ message: "Not authorized!" });
        }
    } catch (err) {
        res.status(500).json({
            message: "Couldn't udpate lottery"
        });
    }
};

exports.deleteLottery = async (req, res) => {
    try {
        const anyTicket = await Ticket.findOne({ lotteryId: req.params.id });

        if (!anyTicket) {
            const result = await Lottery.deleteOne({ _id: req.params.id });
            if (result.n > 0) {
                res.status(200).json({ message: "Deleting lottery was successful!" });
            } else {
                res.status(500).json({ message: "Deleting lottery failed!" });
            }
        } else {
            res.status(500).json({ message: "Deleting lottery failed!" });
        }
    } catch {
        res.status(500).json({ message: "Deleting lottery failed!" });
    }
};