import { useState } from 'react'
import { Autocomplete, TextField, Typography, Box } from '@mui/material'
import type { SymbolOption } from '@/types/symbol.types'
import { useSymbolSearch } from '@/hooks/useSymbolSearch'

interface SymbolAutocompleteProps {
  value: string
  onChange: (value: string, currency?: string) => void
  error?: boolean
  helperText?: string
}

export function SymbolAutocomplete({
  value,
  onChange,
  error,
  helperText,
}: SymbolAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || '')
  const { options, isLoading } = useSymbolSearch(inputValue)

  return (
    <Autocomplete<SymbolOption, false, false, true>
      freeSolo
      options={options}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.code
      }
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue)
        onChange(newInputValue.toUpperCase())
      }}
      onChange={(_event, newValue) => {
        if (typeof newValue === 'string') {
          onChange(newValue.toUpperCase())
        } else if (newValue) {
          onChange(newValue.code, newValue.currency)
          setInputValue(newValue.code)
        }
      }}
      loading={isLoading}
      filterOptions={(x) => x}
      isOptionEqualToValue={(option, val) =>
        option.code === (typeof val === 'string' ? val : val.code)
      }
      renderOption={({ key, ...props }, option) => (
        <Box component="li" key={`${option.code}-${option.exchange}`} {...props}>
          <Typography variant="body1" component="span" fontWeight="bold">
            {option.code}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            {option.name}
          </Typography>
          <Typography
            variant="caption"
            component="span"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            ({option.exchange})
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          label="Symbol"
          error={error}
          helperText={helperText}
          margin="normal"
          required
        />
      )}
    />
  )
}
