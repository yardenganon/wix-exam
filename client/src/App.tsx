import React from 'react';
import './App.scss';
import { createApiClient, Ticket } from './api';

export type AppState = {
  tickets?: Ticket[];
  search: string;
  hiddenTickets: string[];
  pagesNumber: number;
  overallResults: number;
  priority: string
};

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
  state: AppState = {
    search: '',
    hiddenTickets: [],
    pagesNumber: 1,
    overallResults: 200,
    priority: 'all'
  };

  searchDebounce: any = null;

  async componentDidMount() {
    const { search } = this.state;
    const { tickets, pagesNumber, overallResults } = await api.getTickets(
      search,
      1,
      this.state.priority
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
    // Search has been transfered to the back-end
    return (
      <ul className='tickets'>
        {filteredTickets.map((ticket) => (
          <li
            key={ticket.id}
            className='ticket'
            style={
              ticket.priority === 'high'
                ? { backgroundColor: '#ffe8e8' }
                : ticket.priority === 'none'
                ? { backgroundColor: '#fff' }
                : { backgroundColor: '#ebffef' }
            }
          >
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
                  <button key={ticket.id+label} className='label'>{label}</button>
                ))}
            </ul>
            <footer>
              <div className='meta-data'>
                By {ticket.userEmail} |{' '}
                {new Date(ticket.creationTime).toLocaleString()}
              </div>
            </footer>
            <div>
                <div className='priority-btns'>
                <button className='priority-btn' onClick={() => this.setTicketPriority(ticket, 'low')}>
                   <i className="fas fa-chevron-down"></i> 
                 </button>
                <button className='priority-btn' onClick={() => this.setTicketPriority(ticket, 'none')}>
                  <i className="fas fa-times"></i>
                </button>
                <button className='priority-btn' onClick={() => this.setTicketPriority(ticket, 'high')}>
                <div>
                  <i className="fas fa-chevron-up"></i>    
                </div>
                </button>
                </div>
              </div>
          </li>
        ))}
      </ul>
    );
  };

  setTicketPriority = async (ticket: Ticket, priority: string) => {

    await api.setPriority(ticket.id, priority);

    let newTickets = this.state.tickets ? [...this.state.tickets] : [];
    
    if (newTickets) {
      for (var t of newTickets) {
        if (t.id === ticket.id) {
          t.priority = priority;
        }
      }
    }

    this.setState({
      tickets: newTickets,
    });
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
        val,
        1,
        this.state.priority
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
          key={i}
          className='nav-btn'
          onClick={() => {
            this.getPageData(i, this.state.search, this.state.priority);
          }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  getPageData = async (pageNumber: number, search: string, priority : string) => {
    const { tickets, pagesNumber, overallResults } = await api.getTickets(
      search,
      pageNumber,
      priority
    );
    this.setState({
      tickets: tickets,
      pagesNumber: pagesNumber,
      overallResults: overallResults,
      priority: priority
    });
  };

  render() {
    const { tickets, pagesNumber, overallResults } = this.state;
    let resultsTitle;

    if (tickets) {
      resultsTitle =
        this.state.hiddenTickets.length > 0 ? (
          <div className='results'>
            Showing {overallResults} results ({
            this.state.priority === 'all' ? 'all' : this.state.priority === 'high' ? 'high priority' : 
            this.state.priority === 'low' ? 'low priority' : 'no priority'
          }) {' '}
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
          <div className='results'>Showing {overallResults} results ({
            this.state.priority === 'all' ? 'all' : this.state.priority === 'high' ? 'high priority' : 
            this.state.priority === 'low' ? 'low priority' : 'no priority'
          })</div>
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
        <div className='results'>Select priority</div>
        <div className='priority-btns'>
          <button className='priority-btn' onClick={() => this.getPageData(1,this.state.search, 'all')}>All</button>
          <button className='priority-btn' onClick={() => this.getPageData(1,this.state.search, 'high')}>
          <i className="fas fa-chevron-up"></i> High priority</button>
          <button className='priority-btn' onClick={() => this.getPageData(1,this.state.search, 'none')}><i className="fas fa-times"></i> No priority</button>
          <button className='priority-btn' onClick={() => this.getPageData(1,this.state.search, 'low')}><i className="fas fa-chevron-down"></i> Low priority</button>
        </div>
        <div className='results'>Pages</div>
        <ul className='nav'>{this.getButtons(pagesNumber)}</ul>
        {resultsTitle}
        {tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
      </main>
    );
  }
}

export default App;
