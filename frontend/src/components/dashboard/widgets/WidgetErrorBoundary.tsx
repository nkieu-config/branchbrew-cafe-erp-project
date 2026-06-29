"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardErrorPanelClass, dashboardErrorMessageClass, dashboardWidgetErrorIconClassName } from "@/lib/theme/dashboard";

type Props = {
  children: ReactNode;
  onReset?: () => void;
};

type State = { hasError: boolean };

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={dashboardErrorPanelClass()}>
          <AlertTriangle className={dashboardWidgetErrorIconClassName("w-8 h-8")} aria-hidden />
          <p className={dashboardErrorMessageClass()}>Failed to load this widget.</p>
          {this.props.onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onReset?.();
              }}
            >
              Try again
            </Button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
