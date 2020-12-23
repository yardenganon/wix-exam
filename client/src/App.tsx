import React from 'react';
import './App.scss';
import { createApiClient, Ticket } from './api';

export type AppState = {
  tickets?: Ticket[];
  search: string;
  hiddenTickets: string[];
  pagesNumber: number;
  overallResults: number;
};

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
  state: AppState = {
    search: '',
    hiddenTickets: [],
    pagesNumber: 1,
    overallResults: 200,
  };

  searchDebounce: any = null;

  async componentDidMount() {
    const { search } = this.state;
    const { tickets, pagesNumber, overallResults } = await api.getTickets(
      search
    );
    this.setState({
      tickets: tickets,
      pagesNumber: pagesNumber,
      overallResults: overallResults,
    });
  }

  renderTickets = (tickets: Ticket[]) => {
    const filteredTickets = tickets.filter(
      (t) => !this.state.hiddenTickets.includes(t.id)
    );
    // Search has been transfered to the server-side

    return (
      <ul className='tickets'>
        {filteredTickets.map((ticket) => (
          <li key={ticket.id} className='ticket'>
            <div className='hide-btn-container'>
              <button
                className='hide-btn'
                onClick={() => this.hideTicket(ticket.id)}
              >
                Hide
              </button>
            </div>
            <h5 className='title'>{ticket.title}</h5>
            <h5 className='content'>{ticket.content}</h5>
            <ul className='labels'>
              {ticket.labels &&
                ticket.labels.map((label) => (
                  <button className='label'>{label}</button>
                ))}
            </ul>
            <footer>
              <div className='meta-data'>
                By {ticket.userEmail} |{' '}
                {new Date(ticket.creationTime).toLocaleString()}
              </div>
            </footer>
          </li>
        ))}
      </ul>
    );
  };

  hideTicket = async (ticketId: string) => {
    this.setState({
      hiddenTickets: [...this.state.hiddenTickets, ticketId],
    });
  };

  restoreTickets = async () => {
    this.setState({
      hiddenTickets: [],
    });
  };

  onSearch = async (val: string, newPage?: number) => {
    clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(async () => {
      const { tickets, pagesNumber, overallResults } = await api.getTickets(
        val
      );

      this.setState({
        tickets: tickets,
        pagesNumber: pagesNumber,
        search: val,
        overallResults: overallResults,
      });
    }, 300);
  };

  getButtons = (pagesNumber: number) => {
    let buttons = [];
    for (let i = 1; i <= pagesNumber; i++) {
      buttons.push(
        <button
          className='nav-btn'
          onClick={() => {
            this.getPageData(i, this.state.search);
          }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  getPageData = async (pageNumber: number, search: string) => {
    const { tickets, pagesNumber, overallResults } = await api.getTickets(
      search,
      pageNumber
    );
    this.setState({
      tickets: tickets,
      pagesNumber: pagesNumber,
      overallResults: overallResults,
    });
  };

  render() {
    const { tickets, pagesNumber, overallResults } = this.state;

    let resultsTitle;

    if (tickets) {
      resultsTitle =
        this.state.hiddenTickets.length > 0 ? (
          <div className='results'>
            Showing {overallResults} results{' '}
            <i>
              ({this.state.hiddenTickets.length} hidden tickets -{' '}
              <button
                className='restore-btn'
                onClick={() => this.restoreTickets()}
              >
                restore
              </button>
              )
            </i>
          </div>
        ) : (
          <div className='results'>Showing {overallResults} results</div>
        );
    } else {
      resultsTitle = null;
    }

    return (
      <main>
        <h1>Tickets List</h1>
        <header>
          <input
            type='search'
            placeholder='Search...'
            onChange={(e) => this.onSearch(e.target.value)}
          />
        </header>
        <div className='results'>Pages</div>
        <ul className='nav'>{this.getButtons(pagesNumber)}</ul>
        {resultsTitle}
        {tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
      </main>
    );
  }
}

export default App;
