module Password.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)
import Dict

import Password.Types exposing (..)
import Bid.Types exposing
    ( currencyName
    )
import Navigation.Types


root : Model -> Html Msg
root model =
    case model.instance of
        Just instance ->
            instanceModal instance model.passwords

        Nothing ->
            div [] []


instanceModal : Instance -> PasswordDict -> Html Msg
instanceModal instance passwords =
    div [class "modal is-active"]
        [ div
            [ class "modal-background"
            ]
            []
        , div
            [ class "modal-content"
            ]
            [ div [class "box"]
                [ p []
                    [ text "You need to write the passwords to these blockchains to continue:"
                    ]
                , div [] <|
                    List.map
                        (passwordFieldLookup passwords)
                        instance.promptedPasswords
                , buttonRow instance
                ]
            ]
        ]


passwordFieldLookup : PasswordDict -> String -> Html Msg
passwordFieldLookup passwordDict currency =
    case Dict.get currency passwordDict of
        Just password ->
            passwordField currency password

        Nothing ->
            div [] []


passwordField : String -> Password -> Html Msg
passwordField currency password =
    let
        inputId = "password-" ++ currency
        ( passwordValue
        , extraClass
        , info
        , locked
        ) =
            case password of
                UncheckedPassword passwordValue ->
                    ( passwordValue
                    , ""
                    , ""
                    , False
                    )

                IncorrectPassword passwordValue ->
                    ( passwordValue
                    , "is-danger"
                    , "Password is incorrect"
                    , False
                    )

                CorrectPassword len ->
                    ( String.repeat len "*"
                    , "is-success"
                    , ""
                    , True
                    )
        isDisabled = locked
    in
        div [class "field"]
            [ label
                [ class "label"
                , for inputId
                ]
                [ text <| currencyName currency
                ]
            , div [class "control"]
                [ input
                    [ class <| "input " ++ extraClass
                    , id inputId
                    , type_ "text"
                    , placeholder <| "password to " ++ currencyName currency
                    , value passwordValue
                    , onInput <| SetPassword currency
                    , disabled isDisabled
                    ] []
                , p
                    [ class <| "help " ++ extraClass
                    , style [("text-align", "right")]
                    ]
                    [ text info
                    ]
                ]
            ]

buttonRow : Instance -> Html Msg
buttonRow instance =
    div
        [ class "buttons is-right"
        , style [("margin-top", "20px")]
        ]
        [ cancelButton instance.onCancel
        , submitButton
        ]


cancelButton : Maybe Navigation.Types.Msg -> Html Msg
cancelButton maybeCancel =
    case maybeCancel of
        Just _ ->
            button
                [ class "button"
                , onClick Cancel
                ]
                [ text "Cancel"
                ]

        Nothing ->
            span [] []


submitButton : Html Msg
submitButton =
    button
        [ class "button is-link"
        , onClick SubmitSuccess
        ]
        [ text "Submit"
        ]
