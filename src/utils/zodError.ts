import { ZodError, z } from "zod";

type TreeNode = {
    errors?: string[];
    properties?: Record<string, TreeNode | undefined>;
    items?: Array<TreeNode | undefined>;
};

export const extractFieldErrors = (error: ZodError): Record<string, string[]> => {
    const fieldErrors: Record<string, string[]> = {};
    const tree = z.treeifyError(error) as TreeNode | undefined;

    const visit = (node: TreeNode | undefined, path: string[]) => {
        if (!node) {
            return;
        }

        if (node.errors && node.errors.length > 0) {
            const key = path.length === 0 ? "_errors" : path.join(".");
            const existing = fieldErrors[key] ?? [];
            fieldErrors[key] = [...existing, ...node.errors];
        }

        if (node.properties) {
            for (const [childKey, childNode] of Object.entries(node.properties)) {
                visit(childNode, [...path, childKey]);
            }
        }

        if (node.items) {
            node.items.forEach((childNode, index) => {
                visit(childNode, [...path, index.toString()]);
            });
        }
    };

    visit(tree, []);
    return fieldErrors;
};
