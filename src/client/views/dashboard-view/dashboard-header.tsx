import React from "react";

export default class DashboardHeader extends React.Component {
  render() {
    const { customization } = this.props;

    let headerStyle: React.CSSProperties = null;
    if (customization && customization.headerBackground) {
      headerStyle = {
        background: customization.headerBackground
      };
    }

    return (
      <header className="dashboard-header-bar" style={headerStyle}>

      </header>
    );
  }
}