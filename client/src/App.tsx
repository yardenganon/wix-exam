import React from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';

export type AppState = {
	tickets?: Ticket[],
	search: string,
	hiddenTickets: string[];
}

const api = createApiClient();



export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		hiddenTickets: []
	}

	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets()
		});
	}

	
	
	renderTickets = (tickets: Ticket[]) => {
		const filteredTickets = tickets
			.filter((t) =>  (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()) && !this.state.hiddenTickets.includes(t.id));
		
		return (<ul className='tickets'>
			{filteredTickets.map((ticket) => (
				<li key={ticket.id} className='ticket'>
				<button className='hide-btn' onClick={() => this.hideTicket(ticket.id)}>Hide</button>
				<h5 className='title'>{ticket.title}</h5>
				<h5 className='content'>{ticket.content}</h5>
				<ul className='labels'>
					{ticket.labels && ticket.labels.map((label) => (
						<button className='label'>{label}</button>
					))}
					
				</ul>
				<footer>
					<div className='meta-data'>By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}</div>
				</footer>
				</li>
				))}
		</ul>
		);
	}

	hideTicket = async (ticketId : string) => {
		this.setState({
			hiddenTickets: [...this.state.hiddenTickets, ticketId]
		});	
	}

	restoreTickets = async () => {
		this.setState({
			hiddenTickets: []
		});
	}

	onSearch = async (val: string, newPage?: number) => {
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}

	render() {	
		const {tickets} = this.state;
		let resultsTitle;

		if (tickets) {
			resultsTitle = this.state.hiddenTickets.length > 0 ? <div className='results'>Showing {tickets.length} results <i>({this.state.hiddenTickets.length} hidden tickets -<button className="restore-btn" onClick={() => this.restoreTickets()}>restore</button>)</i></div> :
			<div className='results'>Showing {tickets.length} results</div>;
		} else {
			resultsTitle = null;
		}
		

		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			{resultsTitle}
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;