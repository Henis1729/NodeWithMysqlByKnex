export const insertPredefineData = async (models) => {
    const isAdminExist = await models.User.findOne({ email: "admin@admin.com", isAdmin: true })
    if (!isAdminExist) {
        const admin = new models.User({
            userName: 'admin',
            isAdmin: true,
            isActive: true,
            email: 'admin@admin.com',
            password: 'password',
        });
        await admin.save();
        return true
    } else return true
}