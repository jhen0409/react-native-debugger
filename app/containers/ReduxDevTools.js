import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Notification } from '@redux-devtools/ui';
import { clearNotification } from '@redux-devtools/app/lib/esm/actions';
import Header from '@redux-devtools/app/lib/esm/components/Header';
import Actions from '@redux-devtools/app/lib/esm/containers/Actions';
import Settings from '@redux-devtools/app/lib/esm/components/Settings';

class App extends Component {
  render() {
    const { section, theme, notification } = this.props;
    let body;
    switch (section) {
      case 'Settings':
        body = <Settings />;
        break;
      default:
        body = <Actions />;
    }

    return (
      <Container themeData={theme}>
        <Header section={section} />
        {body}
        {notification && (
          <Notification
            type={notification.type}
            onClose={this.props.clearNotification}
          >
            {notification.message}
          </Notification>
        )}
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  section: state.section,
  theme: state.theme,
  notification: state.notification,
});

const actionCreators = {
  clearNotification,
};

export default connect(mapStateToProps, actionCreators)(App);
