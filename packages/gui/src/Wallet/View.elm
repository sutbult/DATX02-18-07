module Wallet.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Wallet.Types exposing (..)
import Error.View

import Bid.Types exposing
    ( currencyName
    , amountString
    )

root : Model -> Html Msg
root model =
    div []
        [ Html.map ToError <| Error.View.root model.error
        , walletTable model
        ]

walletTable : Model -> Html Msg
walletTable model =
    table [class "table is-fullwidth is-hoverable is-striped"]
        [ head
        , tbody []
            <| List.map accountView model.accounts
        ]

head : Html Msg
head =
    thead []
        [ tr []
            [ th [] [text "Currency"]
            , th [] [text "In wallet"]
            ]
        ]

accountView : Account -> Html Msg
accountView account =
    tr []
        [ td []
            [ text <| currencyName account.currency
            ]
        , td []
            [ text <| amountString account
            ]
        ]
