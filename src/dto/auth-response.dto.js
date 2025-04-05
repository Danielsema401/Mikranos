// dtos/auth-response.dto.js
class AuthResponseDTO {
    static format(user, tokenData) {
        return {
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                auth: {
                    tokenType: 'Bearer',
                    accessToken: tokenData.accessToken,
                    refreshToken: tokenData.refreshToken,
                    expiresIn: tokenData.expiresIn
                }
            }
        };
    }
}

module.exports = AuthResponseDTO;
