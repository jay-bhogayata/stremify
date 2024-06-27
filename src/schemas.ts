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

/**
 * @openapi
 * components:
 *   schemas:
 *     MovieReqBody:
 *       type: object
 *       required:
 *         - title
 *         - releaseYear
 *         - duration
 *         - synopsis
 *         - ageRating
 *         - genre
 *         - actors
 *         - warnings
 *         - poster
 *         - backdrop
 *       properties:
 *         title:
 *           type: string
 *           example: "Inception"
 *         releaseYear:
 *           type: string
 *           example: "2010"
 *         duration:
 *           type: string
 *           example: "148"
 *         synopsis:
 *           type: string
 *           example: "A thief who enters the dreams of others to steal secrets from their subconscious."
 *         ageRating:
 *           type: string
 *           example: "PG-13"
 *         genre:
 *           type: string
 *           example: "Action,Sci-Fi,Thriller"
 *         actors:
 *           type: string
 *           example: "Leonardo DiCaprio,Joseph Gordon-Levitt,Ellen Page"
 *         warnings:
 *           type: string
 *           example: "Violence,Intense Scenes"
 *         additional_info:
 *           type: string
 *           format: json
 *           example: '{"director": "Christopher Nolan", "budget": "$160 million"}'
 *         poster:
 *           type: string
 *           title: image
 *           format: binary
 *         backdrop:
 *           type: string
 *           title: image
 *           format: binary
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     MovieImages:
 *       type: object
 *       properties:
 *         image_id:
 *           type: integer
 *           description: The unique identifier for the image
 *           example: 12345
 *         image_url:
 *           type: string
 *           description: The URL of the image
 *           example: https://example.com/image.jpg
 *         image_type:
 *           type: string
 *           description: The type of the image (e.g., 'poster', 'backdrop')
 *           example: poster
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         movie_id:
 *           type: integer
 *           description: The unique identifier for the movie
 *           example: 12345
 *         title:
 *           type: string
 *           description: The title of the movie
 *           example: Inception
 *         release_year:
 *           type: integer
 *           description: The year the movie was released
 *           example: 2010
 *         duration:
 *           type: integer
 *           description: The duration of the movie in minutes
 *           example: 148
 *         synopsis:
 *           type: string
 *           description: A brief summary of the movie's plot
 *           example: A thief who enters the dreams of others to steal secrets from their subconscious.
 *         rating:
 *           type: number
 *           description: The rating of the movie
 *           example: 8.8
 *         age_rating:
 *           type: string
 *           description: The age rating of the movie
 *           example: PG-13
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the movie entry was created
 *           example: 2021-10-01T12:00:00Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the movie entry was last updated
 *           example: 2021-10-01T12:00:00Z
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MovieImages'
 *           description: An array of images associated with the movie
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     AllMoviesResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Movie'
 *       description: An array of Movie objects
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     DetailMovieInfo:
 *       type: object
 *       properties:
 *         movie_id:
 *           type: integer
 *           example: 8
 *         title:
 *           type: string
 *           example: "Attack"
 *         release_year:
 *           type: integer
 *           example: 2022
 *         duration:
 *           type: integer
 *           example: 123
 *         synopsis:
 *           type: string
 *           example: "With the Parliament under siege, India's first super soldier Arjun Shergill is tasked to get hold of the terrorists in the nick of time, save the Prime Minister from their clutches and stop a dirty bomb from exploding and destroying Delhi. Will Arjun succeed in his mission?"
 *         rating:
 *           type: number
 *           nullable: true
 *         age_rating:
 *           type: string
 *           example: "UA"
 *         additional_info:
 *           type: object
 *           properties:
 *             origin_country:
 *               type: string
 *               example: "IN"
 *             original_title:
 *               type: string
 *               example: "Attack"
 *             origin_country_certification:
 *               type: string
 *               example: "UA"
 *             production_companies:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["JA Entertainment", "Pen Studios", "Ajay Kapoor Productions"]
 *             director:
 *               type: string
 *               example: "Lakshya Raj Anand"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         genres:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               genre_id:
 *                 type: integer
 *               genre_name:
 *                 type: string
 *         actors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               actor_id:
 *                 type: integer
 *               actor_name:
 *                 type: string
 *         warnings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               warning_type:
 *                 type: string
 *               content_warning_id:
 *                 type: integer
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               image_id:
 *                 type: integer
 *               image_url:
 *                 type: string
 *               image_type:
 *                 type: string
 */
