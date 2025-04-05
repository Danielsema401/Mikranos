const FraudDetection = {
    async checkRisk(email, ip) {
        const risks = [];

        // 1. Check IP reputation
        const ipReputation = await IPReputationService.check(ip);
        if (ipReputation.score > 70) risks.push('high_risk_ip');

        // 2. Email/phone correlation
        const existingUser = await User.findSimilarRegistration(email);
        if (existingUser) risks.push('possible_duplicate');

        // 3. Velocity check
        const regsLastHour = await Registration.countRegistrations(ip);
        if (regsLastHour > 2) risks.push('high_velocity');

        return {
            isSuspicious: risks.length > 0,
            risks
        };
    }
};

class VerificationService {
    static async sendVerificationEmail(user, token) {
        const verificationLink = `${process.env.BASE_URL}/verify?token=${token}`;

        await EmailService.sendTemplate({
            to: user.email,
            template: 'registration-verify',
            variables: {
                link: verificationLink,
                expiry_hours: 24
            }
        });

        // Security: Log the verification attempt
        await VerificationAttempt.create({
            userId: user.id,
            type: 'email',
            expiresAt: new Date(Date.now() + 86400000) // 24h
        });
    }
}
