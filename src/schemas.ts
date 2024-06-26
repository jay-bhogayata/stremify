/**
 * @openapi
 * components:
 *   schemas:
 *     SignUpUserRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The user's full name.
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           description: The user's password.
 *           minLength: 8
 *           example: password123
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the user.
 *           example: 12345
 *         name:
 *           type: string
 *           description: The user's full name.
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *           example: john.doe@example.com
 *         role:
 *           type: string
 *           enum: [guest, subscriber, admin]
 *           description: The user's role.
 *           example: guest
 *         verified:
 *           type: boolean
 *           description: Whether the user is verified.
 *           example: false
 *         password:
 *           type: string
 *           description: The user's hashed password.
 *           example: $2b$10$K9x9rW3bOzL8wN2GJH9bH.5omVc1RQWTr5eO/N6b2qS0UL9JpXU8W
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     ResponseUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the user.
 *           example: 12345
 *         name:
 *           type: string
 *           description: The user's full name.
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *           example: john.doe@example.com
 *         role:
 *           type: string
 *           enum: [guest, subscriber, admin]
 *           description: The user's role.
 *           example: guest
 *         verified:
 *           type: boolean
 *           description: The user's verification status.
 *           example: false
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     SessionData:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         isLoggedIn:
 *           type: boolean
 *           description: Whether the user is logged in.
 *           example: true
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     AdditionalInfo:
 *       type: object
 *       properties:
 *         origin_country:
 *           type: string
 *           description: The country of origin.
 *           example: USA
 *         original_title:
 *           type: string
 *           description: The original title of the movie.
 *           example: Inception
 *         origin_country_certification:
 *           type: string
 *           description: The certification of the movie in the country of origin.
 *           example: PG-13
 *         production_companies:
 *           type: array
 *           items:
 *             type: string
 *           description: List of production companies.
 *           example: ["Warner Bros.", "Legendary Pictures"]
 *         director:
 *           type: string
 *           description: The director of the movie.
 *           example: Christopher Nolan
 */
