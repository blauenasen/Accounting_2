// Module: src/routes/booking/+server.ts
// Endpoints for booking management - saving journal entries

import { json, type RequestEvent } from '@sveltejs/kit';
import { validateBookingAccounts } from '$lib/server/booking/validation.js';
import { insertJournalEntry, type JournalEntry, type InsertJournalOptions } from '$lib/server/invoice-to-journal.js';
import { setInvoiceBooked, copyPdfFromInvoiceToJournal } from '$lib/server/index.js';

export async function GET(): Promise<Response> {
	return json({ ok: true, data: [] });
}

export async function POST({ request }: RequestEvent): Promise<Response> {
	try {
		const payload = (await request.json()) as Partial<JournalEntry> & {
			ignoreDuplicate?: boolean;
			IdNr?: number;
		};

		validateBookingAccounts(payload);

		const options: InsertJournalOptions = {
			ignoreDuplicate: payload.ignoreDuplicate === true,
			isUpdate: payload.IdNr != null && payload.IdNr !== undefined
		};

		const result = insertJournalEntry(payload as JournalEntry, options);

		if (payload.id_invoice && typeof payload.id_invoice === 'number') {
			setInvoiceBooked(payload.id_invoice, 1);

			if (result.IdNr) {
				copyPdfFromInvoiceToJournal(result.IdNr, payload.id_invoice);
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
