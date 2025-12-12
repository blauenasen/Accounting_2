// Module: src/routes/booking/+server.ts
// Endpoints for booking management - saving journal entries

import { json, type RequestEvent } from '@sveltejs/kit';
import { validateBookingAccounts } from '$lib/server/booking/validation.js';
import { insertJournalEntry, type JournalEntry, type InsertJournalOptions } from '$lib/server/invoice-to-journal.js';
import { setInvoiceBooked, copyPdfFromInvoiceToJournal, getDb } from '$lib/server/index.js';
import { buildJournalPayload } from '$lib/server/booking/payloadBuilder.js';

export async function GET(): Promise<Response> {
	return json({ ok: true, data: [] });
}

export async function POST({ request }: RequestEvent): Promise<Response> {
	try {
		// Parse structured payload from +page.svelte
		const { formData, bookCircle, accountDetails, contraAccountDetails, idNr, ignoreDuplicate } =
			(await request.json()) as {
				formData: any;
				bookCircle: string | number;
				accountDetails: any;
				contraAccountDetails: any;
				idNr?: number;
				ignoreDuplicate?: boolean;
			};

		// Get DB connection
		const db = getDb();

		// Build complete journal entry (11 → 38 fields)
		const context = {
			bookCircle,
			accountDetails,
			contraAccountDetails,
			idNr
		};

		const journalEntry = await buildJournalPayload(formData, context, db);

		// Validate accounts (existing validation)
		validateBookingAccounts(journalEntry);

		// Insert options
		const options: InsertJournalOptions = {
			ignoreDuplicate: ignoreDuplicate === true,
			isUpdate: idNr != null && idNr !== undefined
		};

		// Insert into database
		const result = insertJournalEntry(journalEntry, options);

		// Handle invoice link (existing logic)
		if (journalEntry.id_invoice && typeof journalEntry.id_invoice === 'number') {
			setInvoiceBooked(journalEntry.id_invoice, 1);

			if (result.IdNr) {
				copyPdfFromInvoiceToJournal(result.IdNr, journalEntry.id_invoice);
			}
		}

		return json({
			ok: true,
			message: options.isUpdate ? 'Booking updated successfully' : 'Booking saved successfully',
			...result
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'BOOKING_SAVE_FAILED';
		const status =
			message.startsWith('ACCOUNT_NOT_PERMITTED') ||
			message === 'BOOK_CIRCLE_REQUIRED' ||
			message === 'DUPLICATE_BOOKING'
				? 400
				: 500;

		return json({ ok: false, error: message }, { status });
	}
}
