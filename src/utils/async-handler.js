const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((err) => next(err)) 
    }
};

export { asyncHandler };

// const promise = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve("Pizza is ready 🍕")
//     }, 2000)
// })

// resolve means error didnt occur so in our above function is error doesnt occur we use resolve and send the function back and if there is a error we use err class of nodejs and next(err) is a build in function to throw error