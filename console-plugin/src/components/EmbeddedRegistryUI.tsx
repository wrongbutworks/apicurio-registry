import {
  Button,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Spinner,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon, ExternalLinkAltIcon } from "@patternfly/react-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApicurioRegistry3 } from "../utils/k8s";
import { getEmbeddedUIUrl, getRegistryUIUrl } from "../utils/registry-url";
import "../styles/plugin.css";

interface EmbeddedRegistryUIProps {
  registry: ApicurioRegistry3;
}

const EmbeddedRegistryUI: React.FC<EmbeddedRegistryUIProps> = ({
  registry,
}) => {
  const { t } = useTranslation("plugin__apicurio-registry");
  const [loading, setLoading] = useState(true);

  const uiUrl = getEmbeddedUIUrl(registry);
  const directUrl = getRegistryUIUrl(registry);

  if (!uiUrl) {
    return (
      <EmptyState
        headingLevel="h4"
        icon={ExclamationTriangleIcon}
        titleText={t("Registry UI Unavailable")}
      >
        <EmptyStateBody>
          {t(
            "Unable to determine the Registry UI URL for this instance."
          )}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div className="apicurio-registry-embedded-ui">
      <div className="apicurio-registry-embedded-ui__toolbar">
        <Button
          variant="link"
          component="a"
          href={directUrl!}
          target="_blank"
          rel="noopener noreferrer"
          icon={<ExternalLinkAltIcon />}
          iconPosition="end"
        >
          {t("Open in new tab")}
        </Button>
      </div>
      {loading && (
        <Bullseye>
          <Spinner size="xl" aria-label={t("Loading Registry UI...")} />
        </Bullseye>
      )}
      <iframe
        src={uiUrl}
        title={t("Apicurio Registry")}
        className="apicurio-registry-embedded-ui__iframe"
        onLoad={() => setLoading(false)}
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
};

export default EmbeddedRegistryUI;
