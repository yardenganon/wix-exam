import axios from 'axios';

// Want to get number of pages available
type Response = {
	tickets: Ticket[],
	pagesNumber: number,
	overallResults: number
} 

export type Ticket = {
	id: string,
	title: string;
	content: string;
	creationTime: number;
	userEmail: string;
	labels?: string[];
}

export type ApiClient = {
	getTickets: (search: string, pageNumber?: number) => Promise<Response>,
}

export const createApiClient = (): ApiClient => {
	return {
		getTickets: async (search, pageNumber = 1) => {
			const data = axios.get(`http://localhost:3232/api/tickets`, {
				params: {
					search: search,
					page: pageNumber
				}
			}).then((res) => { return res.data;});
			return data;
		}
	}
}



