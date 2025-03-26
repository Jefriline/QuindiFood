import bcrypt from 'bcryptjs';

const generateHash = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export default generateHash;