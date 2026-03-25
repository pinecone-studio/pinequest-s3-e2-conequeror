import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/db/schemas/*',
	out: './drizzle/migrations',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: '630398f7cca5a714a459a22c46cd6b52',
		databaseId: '0e9746f0-2a0d-4080-b934-fe4a08e99971',
		token: 'cfut_X2f6NDo5DLz0H6MYu2eZrourU06IdDwB7msmSqkhe0d138de',
	},
});
