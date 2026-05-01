import SearchIcon from '@mui/icons-material/Search';
import {TextField} from '@mui/material';
import {ReactNode, useMemo, useState} from 'react';

type SearchFieldProps<T> = {
    items: T[];
    getSearchableValues(item: T): Array<unknown>;
    children(filteredItems: T[]): ReactNode;
    placeholder?: string;
    label?: string;
};

export default function SearchField<T>({items, getSearchableValues, children, placeholder = 'Suchen', label = 'Suchen'}: SearchFieldProps<T>) {
    const [search, setSearch] = useState('');

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return items;
        }

        return items.filter((item) =>
            getSearchableValues(item).some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(query),
            ),
        );
    }, [items, search, getSearchableValues]);

    return (
        <>
            <TextField
                fullWidth
                size="small"
                label={label}
                placeholder={placeholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{mb: 2, maxWidth: 320, alignSelf: 'end'}}
                slotProps={{
                    input: {
                        endAdornment: (
                            <SearchIcon />
                        ),
                    },
                }}
            />

            {children(filteredItems)}
        </>
    );
}
