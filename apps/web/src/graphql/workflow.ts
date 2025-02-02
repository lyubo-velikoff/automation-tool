import { gql } from "@apollo/client";

export const GET_NODE_VARIABLES = gql`
  query GetNodeVariables($nodeId: String!, $nodeName: String!, $results: String!) {
    getNodeVariables(nodeId: $nodeId, nodeName: $nodeName, results: $results) {
      nodeId
      nodeName
      variables {
        reference
        preview
        type
      }
    }
  }
`;

// ... existing queries ... 
